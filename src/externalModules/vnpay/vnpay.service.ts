/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { GatewayServiceRequest } from './vnpay.model';
import { getConfig } from '../../modules/config/config.provider';
import Decimal from 'decimal.js';
import { createTimeStringWithFormat } from '../../shared/helpers';

@Injectable()
export class VnpayService {
  async getVnpayPaymentGatewayRequest(params): Promise<GatewayServiceRequest> {
    const tmnCode = String(getConfig().get('vnpay.merchantCode'));
    const request = GatewayServiceRequest.empty();
    request.vnp_Version = '2.1.0';
    request.vnp_Command = 'pay';
    request.vnp_TmnCode = tmnCode;
    request.vnp_Locale = 'vn';
    request.vnp_CurrCode = 'VND';
    request.vnp_TxnRef = params.orderId;
    request.vnp_OrderInfo = params.orderInfo;
    request.vnp_Amount = new Decimal(params.amount).mul(100).toDP(0).toString();
    request.vnp_ReturnUrl = params.returnUrl;
    request.vnp_IpAddr = params.ipAddr;
    request.vnp_CreateDate = createTimeStringWithFormat(
      new Date(),
      'yyyymmddHHmmss',
    );
    request.updateSignature();
    return request;
  }
}
