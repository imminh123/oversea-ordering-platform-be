import { Role } from '../../shared/constant';
import { BaseDocument } from '../database/database.helpers';
import { Gender } from './authentication.const';

export interface IAuth extends BaseDocument {
  mail?: string;
  fbId?: string;
  ggId?: string;
  phone?: string;
  password?: string;
  role: Role;
  fullname?: string;
  birthday?: string;
  gender?: Gender;
  wareHouseAddress?: string;
  address?: string;
  province?: string;
  city?: string;
  ward?: string;
  isActive: boolean;
}
