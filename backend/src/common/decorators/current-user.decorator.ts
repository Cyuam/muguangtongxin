import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../types/current-user';

/** 当前用户装饰器：从请求中提取已认证用户 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
