import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/types/current-user';

/**
 * 全局审计拦截器
 * 自动记录所有 API 请求
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const user = request.user as CurrentUser | undefined;
    const ip = request.ip ?? request.connection?.remoteAddress;
    const startTime = Date.now();

    // 解析实体和操作
    const { entity, action, entityId } = this.parseRequest(method, url);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.recordAuditLog({
            userId: user?.id,
            action,
            entity,
            entityId,
            detail: {
              method,
              url,
              statusCode: response.statusCode,
              duration,
            },
            ip,
          }).catch((err) => {
            this.logger.error(`审计日志记录失败: ${(err as Error).message}`);
          });
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.recordAuditLog({
            userId: user?.id,
            action,
            entity,
            entityId,
            detail: {
              method,
              url,
              statusCode: err.status ?? 500,
              duration,
              error: err.message,
            },
            ip,
          }).catch((logErr) => {
            this.logger.error(`审计日志记录失败: ${(logErr as Error).message}`);
          });
        },
      }),
    );
  }

  /** 异步记录审计日志 */
  private async recordAuditLog(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    detail?: any;
    ip?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        detail: params.detail ?? null,
        ip: params.ip ?? null,
      },
    });
  }

  /** 从请求中解析实体和操作 */
  private parseRequest(method: string, url: string): { entity: string; action: string; entityId?: string } {
    // 去除查询参数
    const path = url.split('?')[0];
    const segments = path.split('/').filter(Boolean);

    // 跳过 api 前缀
    const relevantSegments = segments[0] === 'api' ? segments.slice(1) : segments;
    const entity = relevantSegments[0]?.toUpperCase() ?? 'UNKNOWN';

    // 根据 HTTP 方法映射操作
    const methodActionMap: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PATCH: 'UPDATE',
      PUT: 'UPDATE',
      DELETE: 'DELETE',
    };
    const action = methodActionMap[method] ?? method;

    // 提取实体 ID（路径中的 UUID 或 cuid）
    const entityId = relevantSegments.find((s) => /^[a-z0-9]{20,}$/i.test(s));

    return { entity, action, entityId };
  }
}
