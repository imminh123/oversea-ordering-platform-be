/* istanbul ignore file */
import { createParamDecorator } from '@nestjs/common';
import { getUserData, getUserId } from '../middleware/user.middleware';

export enum UserDataJwtProperties {
  USERNAME = 'userName',
  USERID = 'userId',
}

export const User = createParamDecorator(
  (data: UserDataJwtProperties | undefined, req) => {
    switch (data) {
      case UserDataJwtProperties.USERID:
        return getUserId();
      default:
        return getUserData();
    }
  },
);
