import { PlainLiteralObject } from '@nestjs/common';
import { toPlainObject } from 'lodash';
import { getSignature, sortObject } from './vnpay.helper';
import { SignatureType } from './vnpay.enum';
import querystring from 'qs';

export class GatewayServiceRequest {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_CreateDate: string;
  vnp_CurrCode: string;
  vnp_IpAddr: string;
  vnp_Locale: string;
  vnp_OrderInfo: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;

  updateSignature(): this {
    this.vnp_SecureHash = getSignature(this, SignatureType.SHA256);
    return this;
  }

  static empty(): GatewayServiceRequest {
    return sortObject(
      new GatewayServiceRequest({
        vnp_Version: '',
        vnp_Command: '',
        vnp_TmnCode: '',
        vnp_Amount: '',
        vnp_CreateDate: '',
        vnp_CurrCode: '',
        vnp_IpAddr: '',
        vnp_Locale: '',
        vnp_OrderInfo: '',
        vnp_ReturnUrl: '',
        vnp_TxnRef: '',
        vnp_SecureHash: '',
      }),
    );
  }

  constructor(props: Partial<GatewayServiceRequest> | Record<string, any>) {
    if (typeof props === 'object') {
      Object.assign(this, props);
    }
  }

  toObject(): PlainLiteralObject {
    return toPlainObject(this);
  }

  toQueryString(): string {
    return querystring.stringify(this, { encode: false });
  }
}
