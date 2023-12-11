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

export interface OrderHistoryDetail {
  status: OrderStatus;
  updatedBy?: string;
  meta?: any;
}
export interface IOrder {
  listItem: DetailItem[];
  userId: string;
  userName: string;
  status: OrderStatus;
  address: any;
  wareHouseAddress: string;
  total: number;
  orderHistories: OrderHistoryDetail[];
}
export interface IOrderDocument extends IOrder, BaseDocument {}
