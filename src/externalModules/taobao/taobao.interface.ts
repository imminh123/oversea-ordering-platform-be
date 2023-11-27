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
}
