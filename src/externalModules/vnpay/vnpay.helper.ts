import { SignatureType } from './vnpay.enum';
import { createHash, createHmac } from 'crypto';
import querystring from 'qs';
import { getConfig } from '../../modules/config/config.provider';

const secretKey = getConfig().get('vnpay.hash');
export function signatureSha256(source: string): string {
  return createHash('sha256').update(source).digest('hex');
}

export function signatureSha512(source: string): string {
  const hmac = createHmac('sha512', secretKey);
  return hmac.update(new Buffer(source, 'utf-8')).digest('hex');
}

export function getSignature(
  input: object,
  type: SignatureType = SignatureType.SHA256,
): string {
  const strSignature = querystring.stringify(input, { encode: false });
  return type === SignatureType.SHA256
    ? signatureSha256(strSignature)
    : signatureSha512(strSignature);
}

export function sortObject(obj: any): any {
  return Object.keys(obj)
    .sort()
    .reduce((accumulator, key) => {
      accumulator[key] = obj[key];

      return accumulator;
    }, {});
}
