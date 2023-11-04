import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from './errors.interface';

export const BASE_ERROR_CODE = '01';
const GROUP_ERROR_CODE = '01';

export const getErrorCode = (code) =>
  `${BASE_ERROR_CODE}${GROUP_ERROR_CODE}${code}`;

export const Errors = {
  PIN_EXITS: {
    message:
      'Pin token with this device and phone number is exits. Please request session by pin',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: getErrorCode(ErrorCode.PIN_EXITS),
    userFriendlyErrorMessage:
      'Pin token with this device and phone number is exits. Please request session by pin',
  },
  WRONG_OTP: {
    message: 'Otp input is invalid. Please try again',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: getErrorCode(ErrorCode.WRONG_OTP),
    userFriendlyErrorMessage: 'Otp is invalid. Please try again',
  },
  WRONG_PIN: {
    message: 'Pin input is invalid. Please try again',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: getErrorCode(ErrorCode.WRONG_PIN),
    userFriendlyErrorMessage: 'Pin is invalid. Please try again',
  },
  GENERAL_VALIDATION_EXCEPTION: {
    message: 'Validation error',
    statusCode: HttpStatus.BAD_REQUEST,
    errorCode: getErrorCode(ErrorCode.GENERAL_VALIDATION_EXCEPTION),
  },
};
