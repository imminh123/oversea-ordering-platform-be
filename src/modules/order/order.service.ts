import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './order.dto';
import { TaobaoService } from '../../externalModules/taobao/taobao.service';
import { VariablesService } from '../variables/variables.service';
import { Errors } from '../../shared/errors/errors';
import { ItemDetailInfo } from '../../externalModules/taobao/taobao.interface';
import { DetailItem, IOrder, IOrderDocument } from './order.interface';
import Decimal from 'decimal.js';
import { OrderStatus } from './order.enum';
import { Variables } from '../variables/variables.helper';
import { isValidObjectId } from 'mongoose';
import { db2api } from '../../shared/helpers';
import { PaymentService } from '../payment/payment.service';
import { PurchaseDto } from '../payment/payment.dto';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { AddressService } from '../address/address.service';
import { CartService } from '../cart/cart.service';
import { IAddress } from '../address/address.interface';
import { ICart } from '../cart/cart.interface';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tbService: TaobaoService,
    private readonly variablesService: VariablesService,
    private readonly paymentService: PaymentService,
    private readonly addressService: AddressService,
    private readonly cartService: CartService,
  ) {}
  async createOrderAndPay(createOrderDto: CreateOrderDto, userId: string) {
    const address = await this.addressService.getDocumentById(
      createOrderDto.addressId,
    );
    const listItem = [];
    listItem.push(
      ...(await this.cartService.getListCartItem(createOrderDto.listItemId)),
    );
    const order = await this.createOrder(
      { ...createOrderDto, address, listItem },
      userId,
    );
    const paymentPayload: PurchaseDto = {
      amount: order.total,
      referenceId: order.id,
      orderInfo: `Pay for order ${order.id}`,
    };
    const payment = await this.paymentService.purchase(paymentPayload, userId);
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
    }: {
      listItem: Partial<ICart>[];
      address: IAddress;
      wareHouseAddress: string;
    },
    userId: string,
  ) {
    const listProduct = [];
    let total = new Decimal(0);
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    for (const item of listItem) {
      const tbItem = await this.tbService.getItemDetailById(
        item.itemId,
        item.skuId,
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
      listProduct.push(orderItem);
      total = total.add(orderItem.vnCost);
    }
    const order = {
      listItem: listProduct,
      userId,
      status: OrderStatus.CREATED,
      address,
      wareHouseAddress,
      total: total.toDP(2).toNumber(),
    } as IOrder;
    return this.orderRepository.create(order);
  }

  async indexOrders(userId: string, pagination: IPagination) {
    const orders = await this.orderRepository.find(
      { userId },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { createdAt: -1 },
      },
    );

    const listLength = await this.orderRepository.count({ userId });
    const responseHeader = getHeaders(pagination, listLength);

    return {
      items: db2api<IOrderDocument[], IOrder[]>(orders),
      headers: responseHeader,
    };
  }

  async getOrderById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Id must be objectId');
    }
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new BadRequestException('Not found order with given id');
    }
    return db2api<IOrderDocument, IOrder>(order);
  }

  async updateOrderStatus(id: string, { status }) {
    await this.getOrderById(id);
    return this.orderRepository.updateById(id, { status });
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
    return {
      itemId: item.item_id,
      itemName: item.title,
      itemUrl: item.product_url,
      shopId: item.shop_info.shop_id,
      shopName: item.shop_info.shop_name,
      shopUrl: item.shop_info.shop_url,
      quantity: volume,
      price: new Decimal(item.sale_price).toDP(2).toNumber(),
      currency: item.currency,
      vnCost: new Decimal(item.sale_price)
        .mul(volume)
        .mul(rate)
        .toDP(2)
        .toNumber(),
      skuId: item.skuid,
      propName: item.props_names,
    };
  }
}
