import { Role } from '../../shared/constant';
import { BaseDocument } from '../../shared/database/database.helpers';
import { Gender } from './authentication.const';

export interface IAuth {
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
  avatar?: string;
  isActive: boolean;
}
export interface IAuthDocument extends IAuth, BaseDocument {}
