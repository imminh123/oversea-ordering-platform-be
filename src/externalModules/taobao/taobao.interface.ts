import { BaseDocument } from '../../shared/database/database.helpers';

export interface ItemDetailInfo {
  item_id: number;
  product_url: string;
  title: string;
  main_imgs: string[];
  video_url?: string;
  currency?: string;
  shop_info: any;
  props_names?: string;
  props_ids?: string;
  sale_price: string;
  skuid: string;
  quantity: number;
}

export interface ICacheItem {
  itemId: number;
  detail: object;
}
export interface ICacheItemDocument extends ICacheItem, BaseDocument {}
