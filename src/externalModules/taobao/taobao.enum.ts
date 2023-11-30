export enum EndpointEnum {
  GetItemDetail = 'http://api.tmapi.top/taobao/item_detail',
  GetItemDetailV2 = 'https://taobao-advanced.p.rapidapi.com/api',
  SearchItem = 'https://taobao-advanced.p.rapidapi.com/item_search_p',
  SearchItemV2 = 'https://taobao-api.p.rapidapi.com/api',
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
