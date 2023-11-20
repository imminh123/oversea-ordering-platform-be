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
  propId?: string;
  propName?: string;
  vnCost: number;
}
export interface IOrder {
  listItem: DetailItem[];
  userId: string;
  status: OrderStatus;
  address: string;
  wareHouseAddress: string;
  total: number;
}
export interface IOrderDocument extends IOrder, BaseDocument {}
