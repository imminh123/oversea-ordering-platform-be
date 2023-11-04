import Decimal from 'decimal.js';
import { Decimal128 } from 'bson';

export function convertToDecimal128(
  value: Decimal | Decimal128 | number | string,
): Decimal128 {
  if (value instanceof Decimal) {
    return Decimal128.fromString((value as Decimal).toString());
  }

  if (value instanceof Decimal128) {
    return value as Decimal128;
  }

  if (typeof value === 'number') {
    return Decimal128.fromString((value as number).toString());
  }

  if (typeof value === 'string') {
    return Decimal128.fromString(value as string);
  }
}

export function convertToDecimal(
  value: Decimal | Decimal128 | number | string,
): Decimal {
  if (!value) {
    return new Decimal(0);
  }
  if (value instanceof Decimal) {
    return value as Decimal;
  }
  if (value instanceof Decimal128) {
    return new Decimal((value as Decimal128).toString());
  }
  if (value && value.constructor.name === 'Decimal128') {
    return new Decimal(value.toString());
  }
  if (typeof value === 'number') {
    return new Decimal(value as number);
  }
  if (typeof value === 'string') {
    return new Decimal(value as string);
  }
}
