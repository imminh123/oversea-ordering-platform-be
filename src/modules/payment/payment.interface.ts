import { BaseDocument } from '../database/database.helpers';
import { PaymentStatus } from './payment.enum';

export interface ITransaction {
  referenceId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  orderInfo: string;
  webhookResponse: string;
}
export interface ITransactionDocument extends ITransaction, BaseDocument {}