import * as httpContext from 'express-http-context';
/* istanbul ignore file */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { decodeJWTToken } from '../shared/helpers';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  async use(req, res, next) {
    const user = await this.getUserSession(req);
    if (user) {
      req.user = user;
      httpContext.set('user', user);
      httpContext.set('userId', user.userId);
    }
    next();
  }

  async getUserSession(req) {
    const accessToken = req.get('access-token');
    if (!accessToken) {
      return null;
    }

    const user = decodeJWTToken(accessToken);
    return user;
  }
}

export function getUserId() {
  return httpContext.get('userId');
}

export function getUserData(key?) {
  if (!key) {
    return httpContext.get('user');
  }
  return httpContext.get('user') ? httpContext.get('user')[key] : null;
}
