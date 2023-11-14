import { getBaseSchema } from '../database/database.helpers';
import { IOrderDocument } from './order.interface';

export const IOrderSchema = getBaseSchema<IOrderDocument>();

const DetailItem = {
  itemId: { type: Number, required: true },
  itemName: { type: String, required: false },
  itemUrl: { type: String, required: false },
  shopId: { type: String, required: false },
  shopName: { type: String, required: false },
  shopUrl: { type: String, required: false },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  vnPrice: { type: Number, required: true },
  currency: { type: String, required: true, default: 'CNY' },
  propId: { type: String, required: false },
  propName: { type: String, required: false },
};

IOrderSchema.add({
  listItem: { type: [DetailItem], required: true },
  userId: { type: String, required: true },
  status: { type: String, required: true },
  address: { type: String, required: true },
  wareHouseAddress: { type: String, required: true },
  total: { type: Number, required: true },
});