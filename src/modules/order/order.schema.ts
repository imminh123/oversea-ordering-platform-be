import { getBaseSchema } from '../../shared/database/database.helpers';
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
  rate: { type: Number, required: true },
  vnCost: { type: Number, required: true },
  currency: { type: String, required: true, default: 'CNY' },
  skuId: { type: String, required: false },
  propName: { type: String, required: false },
  cartId: { type: String, required: false },
  image: { type: String, required: true },
};

const OrderHistoryDetail = {
  status: { type: String, required: false },
  taobaoDeliveryIds: { type: String, required: false },
  listItem: { type: Object, required: false },
  updatedBy: { type: String, required: false },
  meta: { type: Object, required: false },
};

IOrderSchema.add({
  listItem: { type: [DetailItem], required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: false },
  status: { type: String, required: true },
  address: { type: Object, required: true },
  wareHouseAddress: { type: String, required: false },
  total: { type: Number, required: true },
  orderHistories: { type: [OrderHistoryDetail], required: true, default: [] },
  taobaoDeliveryIds: { type: [String], required: false },
  haveCountingFee: { type: Boolean, required: false },
  breakdownDetail: { type: Object, required: true },
});
