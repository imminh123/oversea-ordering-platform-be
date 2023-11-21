import { BaseDocument } from '../../shared/database/database.helpers';

export interface IAddress {
  name: string;
  phone: string;
  mail?: string;
  address: string;
  province: string;
  city: string;
  ward: string;
  userId: string;
  isDefault: boolean;
  note?: string;
}

export interface IAddressDocument extends IAddress, BaseDocument {}
