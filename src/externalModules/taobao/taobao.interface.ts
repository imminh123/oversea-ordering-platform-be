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
interface PriceRangeInfos {
  Price: number;
  ConvertPrice: number;
}
interface OriginalPriceRangeInfos {
  Price: number;
  ConvertPrice: number;
}

export interface SkuProps {
  IsImg: boolean;
  Prop: string;
  Value: { value: string; name: string; imageUrl: string }[];
}

export interface ISearchDetail {
  CategoryId: number;
  OfferId: number;
  Subject: string;
  ImageUrls: string[];
  MainImageVideo: string;
  PriceRangeInfos: PriceRangeInfos[];
  OriginalPriceRangeInfos: OriginalPriceRangeInfos[];
  ProductFeatures: Record<string, string>;
  Delivery: Record<string, string>;
  ShopInfo: Record<string, string>;
  ShopId: string;
  SkuProps: SkuProps[];
  SkuMaps: any[];
  AmountOnSale: number;
  Detail: string;
  ShopName: string;
  ShopUrl: string;
}
