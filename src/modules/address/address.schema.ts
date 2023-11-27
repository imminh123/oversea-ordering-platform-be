import { getBaseSchema } from '../../shared/database/database.helpers';
import { IAddressDocument } from './address.interface';

export const IAddressSchema = getBaseSchema<IAddressDocument>();

IAddressSchema.add({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  mail: { type: String, required: false },
  address: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  ward: { type: String, required: true },
  note: { type: String, required: false },
  userId: { type: String, required: true },
  isDefault: { type: Boolean, required: false, default: false },
});
