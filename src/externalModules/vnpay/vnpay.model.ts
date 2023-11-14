import { PlainLiteralObject } from '@nestjs/common';
import { toPlainObject } from 'lodash';
import { getSignature, sortObject } from './vnpay.helper';
import { SignatureType } from './vnpay.enum';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const querystring = require('qs');

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
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
  vnp_SecureHash?: string;

  updateSignature(): this {
    this.vnp_SecureHash = getSignature(sortObject(this), SignatureType.SHA512);
    return this;
  }

  static empty(): GatewayServiceRequest {
    return new GatewayServiceRequest({
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
    });
  }

  constructor(props: Partial<GatewayServiceRequest>) {
    if (typeof props === 'object') {
      Object.assign(this, props);
    }
  }

  toObject(): PlainLiteralObject {
    return toPlainObject(this);
  }

  toQueryString(): string {
    return querystring.stringify(sortObject(this, 'vnp_SecureHash'), {
      encode: false,
    });
  }
}
