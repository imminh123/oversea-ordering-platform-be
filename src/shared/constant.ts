import { RequestMethod } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';

export enum DbModel {
  Auth = 'Auth',
  Cart = 'Cart',
  Variables = 'Variables',
  Order = 'Order',
  Transactions = 'Transactions',
  Address = 'Address',
  CacheItem = 'CacheItem',
}

export enum Role {
  Root = 'root',
  Admin = 'admin',
  Client = 'client',
}
export const RoleValue: Readonly<{ [key in Role]: number }> = {
  [Role.Root]: 0,
  [Role.Admin]: 1,
  [Role.Client]: 2,
};
export const WebAdminRole = [Role.Admin, Role.Root];

export const EXCLUDED_LOGGER_MIDDLEWARE_ROUTES: RouteInfo[] = [
  {
    path: '/health/services/status',
    method: RequestMethod.GET,
  },
];

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
