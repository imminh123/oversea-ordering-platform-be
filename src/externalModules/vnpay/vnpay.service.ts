/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { GatewayServiceRequest, VietQrGenerateRequest } from './vnpay.model';
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
import { VietQR } from 'vietqr';
import { VietQrInstance, VietQrResponse } from './vnpay.interface';

@Injectable()
export class VnpayService {
  static vietQR: VietQrInstance;
  constructor() {
    VnpayService.vietQR = new VietQR({
      clientID: getConfig().get('vietQr.clientId'),
      apiKey: getConfig().get('vietQr.apiKey'),
    });
  }
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
    request.vnp_TxnRef = params.referenceId;
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

  async getQrFromVietQr(params: {
    amount: number;
    addInfo: string;
  }): Promise<VietQrResponse> {
    const request = VietQrGenerateRequest.empty();
    request.setAmount(params.amount);
    request.setInfo(params.addInfo);
    await request.execute();
    return request.getVietQrResponse();
  }
}
