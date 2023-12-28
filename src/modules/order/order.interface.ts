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
  cnyCost: number;
  cartId?: string;
  image: string;
  id?: string;
}

export interface OrderHistoryDetail {
  taobaoDeliveryIds?: string;
  status?: OrderStatus;
  listItem?: any;
  updatedBy?: string;
  createdAt?: Date;
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
  taobaoDeliveryIds: string[];
  haveCountingFee: boolean;
  breakdownDetail: any;
}
export interface IOrderDocument extends IOrder, BaseDocument {}
