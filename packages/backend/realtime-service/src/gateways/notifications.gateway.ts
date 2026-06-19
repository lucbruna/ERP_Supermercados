import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthWsMiddleware, WsAuthenticatedSocket } from '../services/auth-ws.middleware';
import { NotificationDto } from '../dto';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(private readonly authMiddleware: AuthWsMiddleware) {}

  afterInit(server: Server) {
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('Notifications gateway auth middleware applied');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Notification client connecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { userId, roles, lojaId, unidadeId } = userSocket.data;

    if (userId) {
      const personalRoom = `user:${userId}`;
      await socket.join(personalRoom);
      this.logger.log(`Socket ${socket.id} joined personal room ${personalRoom}`);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);
    }

    if (roles && roles.length > 0) {
      for (const role of roles) {
        const roleRoom = `role:${role}`;
        await socket.join(roleRoom);
        this.logger.log(`Socket ${socket.id} joined role room ${roleRoom}`);
      }
    }

    if (unidadeId) {
      await socket.join(`unidade:${unidadeId}`);
    }

    if (lojaId) {
      await socket.join(`loja:${lojaId}`);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Notification client disconnecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { userId } = userSocket.data;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(socket.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('notification:new')
  async handleNotification(socket: Socket, payload: NotificationDto) {
    try {
      const { userId, targetRoles } = payload;

      if (userId) {
        this.server.to(`user:${userId}`).emit('notification:new', payload);
        this.logger.log(`Notification sent to user:${userId}`);
      } else if (targetRoles && targetRoles.length > 0) {
        for (const role of targetRoles) {
          this.server.to(`role:${role}`).emit('notification:new', payload);
          this.logger.log(`Notification sent to role:${role}`);
        }
      } else {
        this.server.emit('notification:new', payload);
        this.logger.log('Notification broadcast to all');
      }

      return { success: true, notificationId: payload.id };
    } catch (error) {
      this.logger.error(`Error handling notification:new: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  async pushNotification(payload: NotificationDto) {
    const { userId, targetRoles } = payload;

    if (userId) {
      this.server.to(`user:${userId}`).emit('notification:new', payload);
    } else if (targetRoles && targetRoles.length > 0) {
      for (const role of targetRoles) {
        this.server.to(`role:${role}`).emit('notification:new', payload);
      }
    } else {
      this.server.emit('notification:new', payload);
    }

    this.logger.log(`Push notification: ${payload.title}`);
  }

  async pushCriticalAlert(payload: NotificationDto) {
    this.server.emit('alert:critical', {
      ...payload,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    });
    this.logger.warn(`Critical alert pushed: ${payload.title}`);
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}
