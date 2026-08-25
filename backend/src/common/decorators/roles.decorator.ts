import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/enums';

export const ROLES_KEY = 'roles';

/** 角色装饰器：标注端点所需角色 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
