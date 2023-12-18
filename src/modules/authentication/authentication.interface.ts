import { Role } from '../../shared/constant';
import { BaseDocument } from '../../shared/database/database.helpers';
import { Gender } from './authentication.const';

export interface IClientAuth {
  mail?: string;
  fbId?: string;
  ggId?: string;
  phone?: string;
  password?: string;
  userName?: string;
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
  isBlock: boolean;
  registerToken: string;
  resetPasswordToken: string;
  resetPasswordSentAt: Date;
}
export interface IClientAuthDocument extends IClientAuth, BaseDocument {}
