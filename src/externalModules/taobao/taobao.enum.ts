export enum EndpointEnum {
  GetItemDetail = 'http://api.tmapi.top/taobao/item_detail',
  GetItemDetailV2 = 'https://taobao-advanced.p.rapidapi.com/api',
  GetItemDetailV3 = 'https://taobao-tmall-tao-bao-data-service.p.rapidapi.com/item/itemInfo_v2',
  SearchItem = 'https://taobao-advanced.p.rapidapi.com/item_search_p',
  SearchItemV2 = 'https://taobao-api.p.rapidapi.com/api',
  SearchItemV3 = 'https://taobao-tmall-tao-bao-data-service.p.rapidapi.com/search/searchItems',
  SearchByImage = 'https://taobao-tmall-tao-bao-data-service.p.rapidapi.com/search/searchByImage',
}

export enum SortOption {
  default = 'default',
  salesDesc = 'salesDesc',
  priceAsc = 'priceAsc',
  priceDesc = 'priceDesc',
  ratingDesc = 'ratingDesc',
}

export enum SortOptionV2 {
  default = 'default',
  salesDesc = 'sales_des',
  salesAsc = 'sales_asc',
  priceAsc = 'price_asc',
  priceDesc = 'price_des',
}

export enum SortOptionV3 {
  default = 'default',
  totalPriceAsc = 'total_price_asc',
  totalPriceDesc = 'total_price_desc',
  priceAsc = 'price_asc',
  priceDesc = 'price_des',
  volumeDesc = 'volume_desc',
  vendorRatingDesc = 'vendor_rating_desc',
  updatedTimeDesc = 'updated_time_desc',
}

export enum LanguageOptionV3 {
  China = 'zh-CN',
  Taiwan = 'zh-TW',
  English = 'en',
  Vietnamese = 'vi',
}
