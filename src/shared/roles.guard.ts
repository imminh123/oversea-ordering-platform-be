import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './constant';
import { ROLES_KEY } from '../decorators/authorization.decorator';
import { decodeJWTToken } from './helpers';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    const { role } = decodeJWTToken(token);
    return requiredRoles.some((item) => item === role);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.headers['access-token'];
    return token ? token : undefined;
  }
}
