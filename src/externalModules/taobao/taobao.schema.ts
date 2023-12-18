import { getBaseSchema } from '../../shared/database/database.helpers';
import { ICacheItemDocument } from './taobao.interface';

export const ICacheItemSchema = getBaseSchema<ICacheItemDocument>();

ICacheItemSchema.add({
  itemId: { type: Number, required: true },
  detail: { type: Object, required: false },
});
