/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { GatewayServiceRequest } from './vnpay.model';
import { getConfig } from '../../shared/config/config.provider';
import Decimal from 'decimal.js';
import { createTimeStringWithFormat } from '../../shared/helpers';
import {
  Command,
  CurrencyCode,
  LocaleCode,
  maskRequestVnpay,
} from './vnpay.enum';
import { returnUrl } from './vnpay.helper';

@Injectable()
export class VnpayService {
  async getVnpayPaymentGatewayRequest(
    params: any,
  ): Promise<GatewayServiceRequest> {
    const tmnCode = String(getConfig().get('vnpay.merchantCode'));
    const request = GatewayServiceRequest.empty();
    request.vnp_Version = '2.1.0';
    request.vnp_Command = Command.PAY;
    request.vnp_TmnCode = tmnCode;
    request.vnp_Locale = LocaleCode.VN;
    request.vnp_CurrCode = CurrencyCode.VND;
    request.vnp_TxnRef = params.orderId;
    request.vnp_OrderInfo = params.orderInfo || '';
    request.vnp_Amount = new Decimal(params.amount).mul(100).toDP(0).toString();
    request.vnp_OrderType = 'other';
    request.vnp_ReturnUrl = returnUrl;
    request.vnp_IpAddr = params.ipAddr || maskRequestVnpay.ipAddress;
    request.vnp_CreateDate = createTimeStringWithFormat(
      new Date(),
      'YYYYMMDDHHmmss',
    );
    request.updateSignature();
    return request;
  }
}
