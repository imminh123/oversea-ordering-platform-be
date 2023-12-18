import {
  NestInterceptor,
  Injectable,
  ExecutionContext,
  CallHandler,
  RequestMethod,
  Logger,
} from '@nestjs/common';
import { RouteInfo } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EXCLUDED_LOGGER_MIDDLEWARE_ROUTES } from '../shared/constant';
import { getHttpRequestLog } from '../shared/helpers';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isRouteExcluded = EXCLUDED_LOGGER_MIDDLEWARE_ROUTES.some(
      (excludedRoute: RouteInfo) => {
        return (
          request.originalUrl.includes(`${excludedRoute.path}`) &&
          (excludedRoute.method === RequestMethod[request.method as string] ||
            request.method === RequestMethod.ALL)
        );
      },
    );
    const requestLog = getHttpRequestLog(request);
    if (!isRouteExcluded) {
      Logger.log(requestLog, 'LOG_REQUEST');
    }
    return next.handle().pipe(
      map((res) => {
        if (!isRouteExcluded) {
          Logger.log(
            { request: requestLog, response: res },
            'LOG_RESPONSE_BODY',
          );
        }
        return res;
      }),
    );
  }
}
