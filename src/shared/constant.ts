import { RequestMethod } from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';

export enum DbModel {
  Auth = 'Auth',
  Cart = 'Cart',
  Variables = 'Variables',
  Order = 'Order',
  Transactions = 'Transactions',
  Address = 'Address',
}

export enum Role {
  Root = 'root',
  Admin = 'admin',
  Client = 'client',
}
export const WebAdminRole = [Role.Admin, Role.Root];

export const EXCLUDED_LOGGER_MIDDLEWARE_ROUTES: RouteInfo[] = [
  {
    path: '/health/services/status',
    method: RequestMethod.GET,
  },
];

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
