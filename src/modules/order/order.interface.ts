import { BaseDocument } from '../../shared/database/database.helpers';
import { OrderStatus } from './order.enum';

export interface DetailItem {
  itemId: number;
  itemName: string;
  itemUrl: string;
  shopId: string;
  shopName: string;
  shopUrl: string;
  quantity: number;
  price: number;
  currency?: string;
  skuId?: string;
  propName?: string;
  vnCost: number;
  cartId?: string;
  image: string;
}
export interface IOrder {
  listItem: DetailItem[];
  userId: string;
  status: OrderStatus;
  address: any;
  wareHouseAddress: string;
  total: number;
}
export interface IOrderDocument extends IOrder, BaseDocument {}
