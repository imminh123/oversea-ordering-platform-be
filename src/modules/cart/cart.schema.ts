import { getBaseSchema } from '../database/database.helpers';
import { ICartDocument } from './cart.interface';

export const ICartSchema = getBaseSchema<ICartDocument>();

ICartSchema.add({
  itemId: { type: Number, required: true },
  itemName: { type: String, required: false },
  itemUrl: { type: String, required: false },
  shopId: { type: String, required: false },
  shopName: { type: String, required: false },
  shopUrl: { type: String, required: false },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  image: { type: [String], required: false },
  currency: { type: String, required: true, default: 'CNY' },
  propId: { type: String, required: false },
  propName: { type: String, required: false },
  isActive: { type: Boolean, required: true, default: true },
  userId: { type: String, required: true },
});
