import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './order.dto';
import { TaobaoService } from '../../externalModules/taobao/taobao.service';
import { VariablesService } from '../variables/variables.service';
import { Errors } from '../errors/errors';
import { ItemDetailInfo } from '../../externalModules/taobao/taobao.interface';
import { DetailItem, IOrder, IOrderDocument } from './order.interface';
import Decimal from 'decimal.js';
import { OrderStatus } from './order.enum';
import { Variables } from '../variables/variables.helper';
import { isValidObjectId } from 'mongoose';
import { db2api } from '../../shared/helpers';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tbService: TaobaoService,
    private readonly variablesService: VariablesService,
  ) {}
  async createOrder(
    { listItem, address, wareHouseAddress }: CreateOrderDto,
    userId: string,
  ) {
    const listProduct = [];
    let total = new Decimal(0);
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    for (const item of listItem) {
      const tbItem = await this.tbService.getItemDetailById(item.id, item.pvid);
      if (!tbItem) {
        throw new BadRequestException({
          ...Errors.TAOBAO_ITEM_WITH_GIVEN_ID_NOT_EXITS,
          method: `${OrderService.name}:${this.createOrder.name}`,
        });
      }
      const orderItem = this.convertResponseFromTaobaoItem({
        item: tbItem,
        volume: item.volume,
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

  indexOrders() {
    return `This action returns all order`;
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

  update(id: number, updateOrderDto: any) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
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
      propId: item.props_ids,
      propName: item.props_names,
    };
  }
}
