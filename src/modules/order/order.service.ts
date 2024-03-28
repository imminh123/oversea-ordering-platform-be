import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import {
  AdminIndexOrderDto,
  CreateOrderDto,
  ReCreateOrderDto,
  UpdateListItemOrder,
} from './order.dto';
import { TaobaoService } from '../../externalModules/taobao/taobao.service';
import { VariablesService } from '../variables/variables.service';
import { Errors } from '../../shared/errors/errors';
import { ItemDetailInfo } from '../../externalModules/taobao/taobao.interface';
import { DetailItem, IOrder, IOrderDocument } from './order.interface';
import Decimal from 'decimal.js';
import { OrderStatus, UpdatedByUser } from './order.enum';
import { Variables } from '../variables/variables.helper';
import { isValidObjectId } from 'mongoose';
import {
  addTime,
  buildFilterDateParam,
  createTimeStringWithFormat,
  db2api,
} from '../../shared/helpers';
import { PaymentService } from '../payment/payment.service';
import { PurchaseDto } from '../payment/payment.dto';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { AddressService } from '../address/address.service';
import { CartService } from '../cart/cart.service';
import { IAddress } from '../address/address.interface';
import { ICartDocument } from '../cart/cart.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { orderTimeOutInMinutes } from '../payment/payment.enum';
import { stringify } from 'csv-stringify';
import { Readable } from 'stream';
import { NovuService } from '../../externalModules/novu/novu.service';
import { NotificationEvent } from '../../externalModules/novu/novu.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tbService: TaobaoService,
    private readonly variablesService: VariablesService,
    private readonly paymentService: PaymentService,
    private readonly addressService: AddressService,
    private readonly cartService: CartService,
    private readonly notificationService: NovuService,
  ) {}
  async clientCreateOrderAndPay(
    createOrderDto: CreateOrderDto,
    { userId, userName }: { userId: string; userName: string },
  ) {
    const { address, listItem } = await this.prepareListItemAndAddress(
      createOrderDto.addressId,
      createOrderDto.listItemId,
    );
    return this.createOrderAndPay({
      ...createOrderDto,
      address,
      listItem,
      userId,
      userName,
    });
  }

  async clientCreateOrder(
    createOrderDto: CreateOrderDto,
    { userId, userName }: { userId: string; userName: string },
  ) {
    const { address, listItem } = await this.prepareListItemAndAddress(
      createOrderDto.addressId,
      createOrderDto.listItemId,
    );
    console.log(listItem);
    return this.createOrder(
      {
        ...createOrderDto,
        address,
        listItem,
      },
      { userId, userName },
    );
  }

  async clientReCreateOrderAndPay(
    { orderId }: ReCreateOrderDto,
    { userId, userName }: { userId: string; userName: string },
  ) {
    const {
      address,
      listItem,
      wareHouseAddress,
      haveCountingFee = false,
    } = await this.orderRepository.findById(orderId);
    return this.createOrderAndPay(
      {
        wareHouseAddress,
        address,
        listItem,
        userId,
        userName,
        haveCountingFee,
      },
      true,
    );
  }

  async clientReCreateOrder(
    { orderId }: ReCreateOrderDto,
    { userId, userName }: { userId: string; userName: string },
  ) {
    const { address, listItem, wareHouseAddress, haveCountingFee } =
      await this.orderRepository.findById(orderId);
    return this.createOrder(
      {
        wareHouseAddress,
        address,
        listItem,
        haveCountingFee,
      },
      { userId, userName },
      true,
    );
  }

  async createOrderAndPay(
    {
      address,
      listItem,
      userId,
      userName,
      wareHouseAddress,
      haveCountingFee = false,
    }: {
      address: IAddress;
      listItem: ICartDocument[] | any[];
      userId: string;
      userName: string;
      wareHouseAddress?: string;
      haveCountingFee?: boolean;
    },
    isReCreate = false,
  ) {
    const order = await this.createOrder(
      { wareHouseAddress, address, listItem, haveCountingFee },
      { userId, userName },
      isReCreate,
    );
    const paymentPayload: PurchaseDto = {
      referenceId: order.id,
    };
    const payment = await this.paymentService.purchase(
      paymentPayload,
      userId,
      userName,
    );
    return {
      order,
      paymentGatewayUrl: payment.paymentGatewayUrl,
    };
  }

  async createOrder(
    {
      listItem,
      address,
      wareHouseAddress,
      haveCountingFee = false,
    }: {
      listItem: ICartDocument[] | any[];
      address: IAddress;
      wareHouseAddress?: string;
      haveCountingFee?: boolean;
    },
    { userId, userName }: { userId: string; userName: string },
    isReCreate = false,
  ) {
    try {
      const listProduct = [];
      const rate = await this.variablesService.getVariable(
        Variables.EXCHANGE_RATE,
      );
      const current = new Date();
      let countItem = 0;
      let totalInCNY = new Decimal(0);
      const uniqueShopSet = new Set<string>();
      for (const item of listItem) {
        const tbItem = await this.tbService.getItemDetailByIdV2(
          item.itemId,
          undefined,
          item.skuId,
          current,
        );
        if (!tbItem) {
          throw new BadRequestException({
            ...Errors.TAOBAO_ITEM_WITH_GIVEN_ID_NOT_EXITS,
            method: `${OrderService.name}:${this.createOrder.name}`,
          });
        }
        const orderItem = this.convertResponseFromTaobaoItem({
          item: tbItem,
          volume: item.quantity,
          rate,
        });
        uniqueShopSet.add(orderItem.shopId);
        orderItem.cartId = isReCreate ? '' : item?.id;
        countItem++;
        listProduct.push(orderItem);
        totalInCNY = totalInCNY.add(orderItem.cnyCost);
      }
      totalInCNY = totalInCNY.toDP(2);
      const feeVariable =
        (await this.variablesService.getVariable(Variables.FEE)) || 0;
      const feePerOrder = new Decimal(feeVariable).mul(rate).toDP(3);
      const countingFeeVarieble =
        (await this.variablesService.getVariable(Variables.FEE)) || 0;
      const countingFee = haveCountingFee
        ? new Decimal(countingFeeVarieble).mul(rate).toDP(3)
        : new Decimal(0);

      const breakdownDetail = await this.cartService.calculateBreakdownDetail({
        totalInCNY,
        rate,
        feePerOrder,
        countShop: uniqueShopSet.size,
        countingFee,
        countItem,
      });
      const order = {
        listItem: listProduct,
        userId,
        userName,
        status: OrderStatus.CREATED,
        address,
        wareHouseAddress,
        breakdownDetail,
        haveCountingFee,
        total: breakdownDetail.finalTotal.toDP(2).toNumber(),
        orderHistories: [{ status: OrderStatus.CREATED, updatedBy: userId }],
      } as IOrder;
      const orderResult = await this.orderRepository.create(order);
      this.notificationService.triggerNotification({
        event: NotificationEvent.CreateOrderSuccess,
        userId,
        data: {
          date: createTimeStringWithFormat(
            orderResult.createdAt,
            'HH:mm:ss DD-MM-YYYY',
          ),
          orderId: orderResult.id,
        },
      });
      return orderResult;
    } catch (error) {
      this.notificationService.triggerNotification({
        event: NotificationEvent.CreateOrderSuccess,
        userId,
        data: {
          date: createTimeStringWithFormat(new Date(), 'HH:mm:ss DD-MM-YYYY'),
        },
      });
      throw error;
    }
  }

  async indexOrders(
    indexOrderDto: AdminIndexOrderDto,
    pagination: IPagination,
    userId?: string,
  ) {
    const findParam: any = {};
    if (userId) {
      findParam.userId = userId;
    }
    if (indexOrderDto.status) {
      findParam.status = indexOrderDto.status;
    }
    if (indexOrderDto.timeFrom) {
      findParam.createdAt = buildFilterDateParam(
        indexOrderDto.timeFrom,
        indexOrderDto.timeTo,
      );
    }
    if (indexOrderDto.userName) {
      findParam.userName = { $regex: new RegExp(indexOrderDto.userName, 'i') };
    }
    if (indexOrderDto.itemName) {
      findParam['listItem.itemName'] = indexOrderDto.itemName;
    }
    if (indexOrderDto.taobaoDeliveryId) {
      findParam.taobaoDeliveryIds = {
        $regex: new RegExp(indexOrderDto.taobaoDeliveryId, 'i'),
      };
    }
    if (indexOrderDto.onlyCount) {
      return this.orderRepository.count(findParam);
    }

    const orders = await this.orderRepository.find(findParam, {
      skip: pagination.startIndex,
      limit: pagination.perPage,
      sort: { createdAt: -1 },
    });

    const listLength = await this.orderRepository.count(findParam);
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<IOrderDocument[], IOrder[]>(orders),
      headers: responseHeader,
    };
  }

  async downloadListOrders(indexOrderDto: AdminIndexOrderDto, userId?: string) {
    const findParam: any = {};
    if (userId) {
      findParam.userId = userId;
    }
    if (indexOrderDto.status) {
      findParam.status = indexOrderDto.status;
    }
    if (indexOrderDto.timeFrom) {
      findParam.createdAt = buildFilterDateParam(
        indexOrderDto.timeFrom,
        indexOrderDto.timeTo,
      );
    }
    if (indexOrderDto.userName) {
      findParam.userName = { $regex: new RegExp(indexOrderDto.userName, 'i') };
    }
    if (indexOrderDto.itemName) {
      findParam['listItem.itemName'] = indexOrderDto.itemName;
    }
    if (indexOrderDto.taobaoDeliveryId) {
      findParam.taobaoDeliveryIds = {
        $regex: new RegExp(indexOrderDto.taobaoDeliveryId, 'i'),
      };
    }

    const orders = await this.orderRepository.find(findParam, {
      sort: { createdAt: -1 },
      batchSize: 100000,
    });

    const csvStream = stringify({
      columns: ['product', 'status', 'address', 'total', 'createdAt'],
    });
    csvStream.on('error', (err) => console.log(JSON.stringify(err)));
    csvStream.write([
      'Sản phẩm',
      'Trạng thái',
      'Địa chỉ',
      'Tổng tiền',
      'Thời gian tạo',
    ]);

    for await (const {
      listItem,
      status,
      address,
      total,
      createdAt,
    } of orders) {
      const product = [];
      for (const item of listItem) {
        product.push(item.itemName || '');
        product.push(item.propName || '');
      }
      const customerAddress = [
        address.name,
        address.phone,
        address.address,
        address.ward,
        address.city,
        address.province,
      ];
      csvStream.write({
        product: product.join('\n'),
        status,
        address: customerAddress.join(', '),
        total,
        createdAt: createTimeStringWithFormat(createdAt, 'HH:mm:ss DD-MM-YYYY'),
      });
    }
    csvStream.end();
    return Readable.from(csvStream);
  }

  async getOrderById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id must be objectId');
    }
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new BadRequestException('Không tìm thấy order');
    }
    return order;
  }

  async clientGetOrderById(id: string) {
    return this.userGetOrderById(id, ['taobaoDeliveryId']);
  }

  async adminGetOrderById(id: string) {
    return this.userGetOrderById(id);
  }

  async userGetOrderById(id: string, excludeFields: string[] = []) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id must be objectId');
    }
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new BadRequestException('Không tìm thấy order');
    }
    return db2api<IOrderDocument, IOrderDocument>(order, excludeFields);
  }

  async updateOrderStatus(
    id: string,
    {
      status,
      updatedBy,
      meta = {},
    }: {
      status: OrderStatus;
      updatedBy?: string;
      meta?: any;
    },
    isWebhook = false,
  ) {
    const order = await this.getOrderById(id);
    if (order.status === status) {
      return order;
    }
    if (
      !isWebhook &&
      [OrderStatus.CANCELLED, OrderStatus.FAILED, OrderStatus.TIMEOUT].includes(
        order.status,
      )
    ) {
      throw new BadRequestException(
        'Không thể cập nhật đơn hàng với trạng thái hiện tại',
      );
    }
    const orderHistories = order.orderHistories || [];
    orderHistories.push({
      status,
      updatedBy,
      meta,
      createdAt: new Date(),
    });
    order.orderHistories = orderHistories;
    order.status = status;

    order.save({ validateModifiedOnly: true });
    this.notificationService.triggerNotification({
      event: NotificationEvent.UpdateOrder,
      userId: order.userId,
      data: {
        date: createTimeStringWithFormat(
          order.updatedAt,
          'HH:mm:ss DD-MM-YYYY',
        ),
        orderId: order.id,
      },
    });
    return order;
  }

  async updateOrderDetail(
    id: string,
    {
      taobaoDeliveryIds,
      listItem,
      updatedBy,
      meta = {},
    }: {
      taobaoDeliveryIds: string[];
      listItem?: UpdateListItemOrder[];
      updatedBy?: string;
      meta?: any;
    },
  ) {
    const order = await this.getOrderById(id);
    if (
      [
        OrderStatus.CANCELLED,
        OrderStatus.FAILED,
        OrderStatus.SUCCEEDED,
        OrderStatus.TIMEOUT,
      ].includes(order.status)
    ) {
      throw new BadRequestException(
        'Không thể cập nhật đơn hàng với trạng thái hiện tại',
      );
    }
    if (listItem && listItem.length > 0) {
      let refundAmount = new Decimal(0);
      for (const item of listItem) {
        const orderItem = order.listItem.find((x) => {
          return x.id === item.id;
        });
        if (item.quantity < 0 || item.quantity > orderItem.quantity) {
          throw new BadRequestException(
            'Quantity của item không hợp lệ',
            item.id,
          );
        }
        refundAmount = refundAmount.add(orderItem.vnCost);
        const rate =
          orderItem.rate ||
          new Decimal(orderItem.vnCost)
            .dividedBy(orderItem.price)
            .toDP(0)
            .toNumber();
        if (!orderItem.rate) {
          orderItem.rate = rate;
        }
        orderItem.vnCost = rate * item.quantity;
        orderItem.quantity = item.quantity;
        refundAmount = refundAmount.sub(orderItem.vnCost);
      }
      order.total = refundAmount.sub(order.total).abs().toDP(2).toNumber();
      meta.refundAmount = refundAmount.toDP(2).toNumber();
    }
    if (taobaoDeliveryIds) {
      order.taobaoDeliveryIds = taobaoDeliveryIds;
    }
    const orderHistories = order.orderHistories || [];
    orderHistories.push({
      taobaoDeliveryIds: taobaoDeliveryIds.join(','),
      status: order.status,
      listItem,
      updatedBy,
      meta,
      createdAt: new Date(),
    });
    order.orderHistories = orderHistories;
    order.save({ validateModifiedOnly: true });
    this.notificationService.triggerNotification({
      event: NotificationEvent.UpdateOrder,
      userId: order.userId,
      data: {
        date: createTimeStringWithFormat(
          order.updatedAt,
          'HH:mm:ss DD-MM-YYYY',
        ),
        orderId: order.id,
      },
    });
    return order;
  }

  private async prepareListItemAndAddress(
    addressId: string,
    listItemId: string[],
  ): Promise<{ address: IAddress; listItem: ICartDocument[] }> {
    const listItem = [];
    const address = await this.addressService.getDocumentById(addressId);
    listItem.push(...(await this.cartService.getListCartItem(listItemId)));
    return { address, listItem };
  }

  private convertResponseFromTaobaoItem({
    item,
    volume,
    rate,
  }: {
    item: ItemDetailInfo;
    volume: number;
    rate: number | string;
  }): DetailItem {
    if (volume > item.quantity) {
      throw new BadRequestException(
        `Số lượng hàng còn lại không đủ. Hiện tại trền sàn còn ${item.quantity}`,
      );
    }
    const cnyCost = new Decimal(item.sale_price).mul(volume).toDP(2);
    return {
      itemId: item.item_id,
      itemName: item.title,
      itemUrl: item.product_url,
      shopId: item.shop_info.shop_id,
      shopName: item.shop_info.shop_name,
      shopUrl: item.shop_info.shop_url,
      quantity: volume,
      rate: new Decimal(rate).toDP(2).toNumber(),
      price: new Decimal(item.sale_price).toDP(2).toNumber(),
      currency: item.currency,
      cnyCost: cnyCost.toNumber(),
      vnCost: cnyCost.mul(rate).toDP(2).toNumber(),
      skuId: item.skuid,
      propName: item.props_names,
      image: item.main_imgs[0],
    };
  }

  async updateOrderTimeout(listOrder: IOrderDocument[]) {
    return listOrder.map(
      async (order) =>
        await this.updateOrderStatus(order.id, {
          status: OrderStatus.TIMEOUT,
          updatedBy: UpdatedByUser.SYSTEM,
        }),
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOrderCron() {
    const findParam: any = {};
    findParam.createdAt = {
      $lte: addTime(new Date(), -1 * orderTimeOutInMinutes, 'minute'),
    };
    findParam.status = {
      $in: [OrderStatus.CREATED, OrderStatus.PENDING_PAYMENT],
    };
    const listOrder = await this.orderRepository.find(findParam);
    const listOrderId = [];
    for (const order of listOrder) {
      listOrderId.push(order.id);
    }
    return Promise.all([
      this.updateOrderTimeout(listOrder),
      this.paymentService.updateTransactionTimeout(listOrderId),
    ]);
  }
}
