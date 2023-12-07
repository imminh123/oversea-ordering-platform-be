import { BaseDocument } from '../../shared/database/database.helpers';

export interface ICart {
  itemId: number;
  itemName: string;
  itemUrl: string;
  shopId: string;
  shopName: string;
  shopUrl: string;
  quantity: number;
  price: number;
  image: string[];
  currency?: string;
  skuId?: string;
  propName?: string;
  isActive: boolean;
  userId: string;
}
export interface ICartDocument extends ICart, BaseDocument {}
