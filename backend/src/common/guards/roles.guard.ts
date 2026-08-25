import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { CurrentUser } from '../types/current-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: CurrentUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`无权限访问，需要角色: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
