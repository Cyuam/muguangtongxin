import { Role } from '../constants/enums';

/** JWT Payload */
export interface JwtPayload {
  sub: string;       // user id
  phone: string;
  role: Role;
}

/** 当前认证用户（挂载到 request.user） */
export interface CurrentUser {
  id: string;
  phone: string;
  role: Role;
  name: string;
  jurisdiction?: string;
  ageGroup?: string;
}
