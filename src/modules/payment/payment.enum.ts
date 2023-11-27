import { getConfig } from '../../shared/config/config.provider';

export enum PaymentStatus {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  PENDING = 'pending',
}
export const vnpayEndpoint = getConfig().get('vnpay.endpoint');
