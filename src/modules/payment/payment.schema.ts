import { getBaseSchema } from '../database/database.helpers';
import { PaymentStatus } from './payment.enum';
import { ITransactionDocument } from './payment.interface';

export const ITransactionSchema = getBaseSchema<ITransactionDocument>();

ITransactionSchema.add({
  userId: { type: String, required: true },
  referenceId: { type: String, required: true },
  orderInfo: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: PaymentStatus },
  webhookResponse: { type: String, required: false },
});