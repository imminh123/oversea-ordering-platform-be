import { PlainLiteralObject } from '@nestjs/common';
import { toPlainObject } from 'lodash';
import {
  getMerchantBankAccount,
  getSignature,
  sortObject,
} from './vnpay.helper';
import { SignatureType } from './vnpay.enum';
import { GenQRCodeBase64Request, VietQrResponse } from './vnpay.interface';
import { VnpayService } from './vnpay.service';
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
      vnp_OrderType: '',
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

export class VietQrGenerateRequest implements GenQRCodeBase64Request {
  accountNumber: string;
  accountName: string;
  bank: number;
  amount: number;
  memo: string;
  template: string;
  private vietQrResponse: VietQrResponse;

  static empty(): VietQrGenerateRequest {
    const { accountNo, accountName, acqId } = getMerchantBankAccount();
    return new VietQrGenerateRequest({
      accountNumber: accountNo,
      accountName,
      bank: acqId,
      amount: 0,
      memo: '',
      template: 'compact2',
    });
  }

  constructor(props: Partial<VietQrGenerateRequest>) {
    if (typeof props === 'object') {
      Object.assign(this, props);
    }
  }

  setAmount(amount: number) {
    this.amount = amount;
  }

  setInfo(addInfo: string) {
    this.memo = addInfo;
  }

  toObject(): GenQRCodeBase64Request {
    return {
      accountNumber: this.accountNumber,
      accountName: this.accountName,
      bank: this.bank,
      amount: this.amount,
      memo: this.memo,
      template: this.template,
    };
  }

  async execute() {
    this.vietQrResponse = await VnpayService.vietQR
      .genQRCodeBase64(this.toObject())
      .then(({ data }) => data)
      .catch((error) => ({
        code: '500',
        desc: error.message || JSON.stringify(error),
      }));
  }

  getVietQrResponse(): VietQrResponse {
    return this.vietQrResponse;
  }
}
