import { IsString, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/constants/enums';

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6, { message: '密码长度至少 6 位' })
  password: string;

  @ApiProperty({ description: '登录角色', enum: Role, example: Role.CHILD })
  @IsEnum(Role)
  role: Role;
}
