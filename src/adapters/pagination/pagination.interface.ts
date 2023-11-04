export interface IPaginationHeader {
  'x-page': number;
  'x-total-count': number;
  'x-pages-count': number;
  'x-per-page': number;
  'x-next-page': number;
}

export interface IPagination {
  page: number;
  perPage: number;
  startIndex?: number;
  endIndex?: number;
}

export interface IPaginationResponse<T> {
  items: T[];
  headers: IPaginationHeader;
}
