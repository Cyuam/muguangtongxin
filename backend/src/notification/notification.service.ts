import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /** WebSocket 实时推送（通过事件发射，由 Gateway 监听） */
  async pushRealtime(userId: string, event: string, data: any): Promise<void> {
    // 记录通知日志
    this.logger.log(`[WebSocket] 推送事件 ${event} 到用户 ${userId}`);

    // 通过 Prisma 事务确保数据一致性
    // 实际推送由 NotificationGateway 通过 @Subscription 或内部 EventEmitter 处理
    // 这里将通知存入数据库，Gateway 轮询或通过事件触发推送
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'NOTIFICATION_PUSH',
        entity: 'NOTIFICATION',
        entityId: userId,
        detail: { event, data, channel: 'WEBSOCKET' },
      },
    });
  }

  /** 短信兜底通知 */
  async sendSms(phone: string, templateCode: string, params: Record<string, string>): Promise<boolean> {
    this.logger.log(`[SMS] 发送短信到 ${phone}, 模板: ${templateCode}`);

    // 短信发送逻辑（实际项目中对接短信服务商）
    // 这里作为兜底通知，当 WebSocket 推送失败时使用
    const smsEnabled = this.configService.get<string>('SMS_ENABLED', 'false') === 'true';
    if (!smsEnabled) {
      this.logger.warn(`[SMS] 短信服务未启用，跳过发送到 ${phone}`);
      return false;
    }

    // 模拟短信发送
    this.logger.log(`[SMS] 短信已发送到 ${phone}: 模板=${templateCode}, 参数=${JSON.stringify(params)}`);
    return true;
  }

  /** 发送预警通知（WebSocket + 短信兜底） */
  async sendWarningNotification(parentId: string, parentPhone: string, warning: any): Promise<void> {
    // 优先 WebSocket 实时推送
    try {
      await this.pushRealtime(parentId, 'warning', warning);
    } catch (err) {
      this.logger.error(`WebSocket 推送失败，降级到短信: ${(err as Error).message}`);
      // WebSocket 失败，降级到短信
      await this.sendSms(parentPhone, 'WARNING_TEMPLATE', {
        riskLevel: warning.riskLevel,
        studentName: warning.studentName ?? '',
      });
    }
  }

  /** 发送监护建议通知 */
  async sendCareAdviceNotification(parentId: string, parentPhone: string, advice: any): Promise<void> {
    try {
      await this.pushRealtime(parentId, 'care_advice', advice);
    } catch (err) {
      this.logger.error(`WebSocket 推送失败，降级到短信: ${(err as Error).message}`);
      await this.sendSms(parentPhone, 'CARE_ADVICE_TEMPLATE', {
        topic: advice.topic ?? '',
      });
    }
  }

  /** 发送任务通知 */
  async sendTaskNotification(userId: string, phone: string, task: any): Promise<void> {
    try {
      await this.pushRealtime(userId, 'task', task);
    } catch (err) {
      this.logger.error(`WebSocket 推送失败，降级到短信: ${(err as Error).message}`);
      await this.sendSms(phone, 'TASK_TEMPLATE', {
        title: task.title ?? '',
      });
    }
  }

  /** 批量推送通知 */
  async batchPush(userIds: string[], event: string, data: any): Promise<void> {
    for (const userId of userIds) {
      await this.pushRealtime(userId, event, data);
    }
  }
}
