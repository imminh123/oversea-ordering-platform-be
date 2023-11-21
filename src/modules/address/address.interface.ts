import { BaseDocument } from '../../shared/database/database.helpers';

export interface IAddress {
  address: string;
  province: string;
  city: string;
  ward: string;
  userId: string;
  isDefault: boolean;
}

export interface IAddressDocument extends IAddress, BaseDocument {}
