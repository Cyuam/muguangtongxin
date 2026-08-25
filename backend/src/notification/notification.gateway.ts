import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket 通知网关
 * 处理实时连接、事件推送
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationGateway.name);
  @WebSocketServer()
  server: Server;

  // 用户 ID -> Socket ID 映射
  private userSocketMap = new Map<string, Set<string>>();

  /** 客户端连接 */
  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    this.logger.log(`客户端连接: ${client.id}`);

    // 从握手信息中获取用户 ID（通过 JWT 认证）
    const userId = this.extractUserId(client);
    if (userId) {
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, new Set());
      }
      this.userSocketMap.get(userId)!.add(client.id);
      this.logger.log(`用户 ${userId} 已连接，当前在线: ${this.userSocketMap.get(userId)!.size}`);
    }
  }

  /** 客户端断开连接 */
  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`客户端断开: ${client.id}`);

    const userId = this.extractUserId(client);
    if (userId) {
      const sockets = this.userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSocketMap.delete(userId);
        }
      }
    }
  }

  /** 客户端订阅特定事件 */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: Socket,
  ): { status: string; channel: string } {
    client.join(data.channel);
    this.logger.log(`客户端 ${client.id} 订阅频道: ${data.channel}`);
    return { status: 'subscribed', channel: data.channel };
  }

  /** 客户端取消订阅 */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { channel: string },
    @ConnectedSocket() client: Socket,
  ): { status: string; channel: string } {
    client.leave(data.channel);
    this.logger.log(`客户端 ${client.id} 取消订阅频道: ${data.channel}`);
    return { status: 'unsubscribed', channel: data.channel };
  }

  /** 心跳检测 */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): { status: string; timestamp: number } {
    return { status: 'pong', timestamp: Date.now() };
  }

  /** 向指定用户推送事件 */
  pushToUser(userId: string, event: string, data: any): boolean {
    const sockets = this.userSocketMap.get(userId);
    if (!sockets || sockets.size === 0) {
      this.logger.warn(`用户 ${userId} 不在线，无法推送`);
      return false;
    }

    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
    }
    return true;
  }

  /** 向频道广播事件 */
  broadcastToChannel(channel: string, event: string, data: any): void {
    this.server.to(channel).emit(event, data);
  }

  /** 获取在线用户数 */
  getOnlineUserCount(): number {
    return this.userSocketMap.size;
  }

  /** 检查用户是否在线 */
  isUserOnline(userId: string): boolean {
    const sockets = this.userSocketMap.get(userId);
    return !!sockets && sockets.size > 0;
  }

  /** 从 Socket 握手信息中提取用户 ID */
  private extractUserId(client: Socket): string | null {
    const handshake = client.handshake as any;
    // 从 auth 或 headers 中获取 token 并解析
    const token = handshake.auth?.token ?? handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return null;

    // 实际项目中应解析 JWT 获取 userId
    // 这里从 query 中获取（简化处理）
    return handshake.query?.userId ?? null;
  }
}
