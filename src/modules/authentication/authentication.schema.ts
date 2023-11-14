import { getBaseSchema } from '../database/database.helpers';
import { Gender } from './authentication.const';
import { IAuth } from './authentication.interface';

export const IAuthSchema = getBaseSchema<IAuth>();

IAuthSchema.add({
  mail: { type: String, required: false },
  fbId: { type: String, required: false },
  ggId: { type: String, required: false },
  phone: { type: String, required: false },
  password: { type: String, required: false },
  role: { type: String, required: true },
  fullname: { type: String, required: false },
  birthday: { type: String, required: false },
  gender: { type: String, enum: Gender, required: false },
  wareHouseAddress: { type: String, required: false },
  address: { type: String, required: false },
  province: { type: String, required: false },
  city: { type: String, required: false },
  ward: { type: String, required: false },
  isActive: { type: Boolean, required: true, default: true },
});
