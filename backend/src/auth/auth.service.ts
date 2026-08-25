import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/constants/enums';
import { JwtPayload } from '../common/types/current-user';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /** 登录：验证手机号+密码，签发双 token */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    if (user.role !== dto.role) {
      throw new UnauthorizedException('角色不匹配，请选择正确的身份登录');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default_refresh'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d'),
    });

    this.logger.log(`用户登录成功: ${user.phone} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
        ageGroup: user.ageGroup,
        isLeftBehind: user.isLeftBehind,
        jurisdiction: user.jurisdiction,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /** 刷新 access token */
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default_refresh'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /** 获取当前用户信息 */
  async getMe(userId: string) {
    return this.usersService.findById(userId);
  }

  /** 哈希密码 */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
