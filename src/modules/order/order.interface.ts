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
  rate: number;
  price: number;
  currency?: string;
  skuId?: string;
  propName?: string;
  vnCost: number;
  cartId?: string;
  image: string;
  id?: string;
}

export interface OrderHistoryDetail {
  taobaoDeliveryId?: string;
  status?: OrderStatus;
  listItem?: any;
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
  taobaoDeliveryId: string;
}
export interface IOrderDocument extends IOrder, BaseDocument {}
