import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** 公开访问装饰器：跳过 JWT 认证 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
