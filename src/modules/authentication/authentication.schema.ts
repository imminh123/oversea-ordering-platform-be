import { getBaseSchema } from '../../shared/database/database.helpers';
import { Gender } from './authentication.const';
import { IClientAuthDocument } from './authentication.interface';

export const IClientAuthSchema = getBaseSchema<IClientAuthDocument>();

IClientAuthSchema.add({
  mail: { type: String, required: false },
  fbId: { type: String, required: false },
  ggId: { type: String, required: false },
  phone: { type: String, required: false },
  password: { type: String, required: false },
  role: { type: String, required: true },
  userName: { type: String, required: false },
  fullname: { type: String, required: false },
  birthday: { type: String, required: false },
  gender: { type: String, enum: Gender, required: false },
  wareHouseAddress: { type: String, required: false },
  address: { type: String, required: false },
  province: { type: String, required: false },
  city: { type: String, required: false },
  ward: { type: String, required: false },
  avatar: { type: String, required: false },
  isActive: { type: Boolean, required: true, default: true },
  isBlock: { type: Boolean, required: true, default: false },
  registerToken: { type: String, required: false },
  resetPasswordToken: { type: String, required: false },
  resetPasswordSentAt: { type: Date, required: false },
});
