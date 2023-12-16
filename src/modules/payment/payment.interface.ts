import { BaseDocument } from '../../shared/database/database.helpers';
import { PaymentStatus } from './payment.enum';

export interface ITransaction {
  referenceId: string;
  userId: string;
  userName: string;
  amount: number;
  status: PaymentStatus;
  orderInfo: string;
  webhookResponse?: string;
  bankCode?: string;
  cardType?: string;
  payDate?: Date;
  bankTranNo?: string;
  vnpayTranNo?: string;
}
export interface ITransactionDocument extends ITransaction, BaseDocument {}
