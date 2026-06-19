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
import { OrderNewDto, OrderUpdatedDto, PaymentCompletedDto, PdvStatusDto, TabOpenDto } from '../dto';

@WebSocketGateway({
  namespace: '/pdv',
  cors: { origin: '*', credentials: true },
})
export class PdvGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PdvGateway.name);
  private readonly connectedPdvSockets = new Map<string, Set<string>>();

  constructor(private readonly authMiddleware: AuthWsMiddleware) {}

  afterInit(server: Server) {
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('PDV gateway auth middleware applied');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`PDV client connecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { lojaId, unidadeId } = userSocket.data;

    if (lojaId && unidadeId) {
      const room = `unidade:${unidadeId}`;
      await socket.join(room);
      this.logger.log(`Socket ${socket.id} joined room ${room}`);

      const pdvKey = `${unidadeId}:${socket.id}`;
      if (!this.connectedPdvSockets.has(unidadeId)) {
        this.connectedPdvSockets.set(unidadeId, new Set());
      }
      this.connectedPdvSockets.get(unidadeId)!.add(socket.id);

      this.server.to(room).emit('pdv:status', {
        pdvId: socket.id,
        status: 'online',
        connectedAt: new Date().toISOString(),
        unidadeId,
      });
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`PDV client disconnecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { unidadeId } = userSocket.data;

    if (unidadeId && this.connectedPdvSockets.has(unidadeId)) {
      this.connectedPdvSockets.get(unidadeId)!.delete(socket.id);
      if (this.connectedPdvSockets.get(unidadeId)!.size === 0) {
        this.connectedPdvSockets.delete(unidadeId);
      }

      this.server.to(`unidade:${unidadeId}`).emit('pdv:status', {
        pdvId: socket.id,
        status: 'offline',
        disconnectedAt: new Date().toISOString(),
        unidadeId,
      });
    }
  }

  @SubscribeMessage('order:new')
  async handleNewOrder(socket: Socket, payload: OrderNewDto) {
    try {
      const userSocket = socket as WsAuthenticatedSocket;
      const { unidadeId } = userSocket.data;
      if (!unidadeId) throw new WsException('unidadeId not found');

      this.logger.log(`New order ${payload.orderId} in unidade ${unidadeId}`);
      this.server.to(`unidade:${unidadeId}`).emit('order:new', payload);
      return { success: true, orderId: payload.orderId };
    } catch (error) {
      this.logger.error(`Error handling order:new: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('order:updated')
  async handleOrderUpdated(socket: Socket, payload: OrderUpdatedDto) {
    try {
      const userSocket = socket as WsAuthenticatedSocket;
      const { unidadeId } = userSocket.data;
      if (!unidadeId) throw new WsException('unidadeId not found');

      this.logger.log(`Order ${payload.orderId} updated in unidade ${unidadeId}`);
      this.server.to(`unidade:${unidadeId}`).emit('order:updated', payload);
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('payment:completed')
  async handlePaymentCompleted(socket: Socket, payload: PaymentCompletedDto) {
    try {
      const userSocket = socket as WsAuthenticatedSocket;
      const { unidadeId } = userSocket.data;
      if (!unidadeId) throw new WsException('unidadeId not found');

      this.logger.log(`Payment completed for order ${payload.orderId} in unidade ${unidadeId}`);
      this.server.to(`unidade:${unidadeId}`).emit('payment:completed', payload);
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('pdv:status')
  async handlePdvStatus(socket: Socket, payload: PdvStatusDto) {
    try {
      const userSocket = socket as WsAuthenticatedSocket;
      const { unidadeId } = userSocket.data;
      if (!unidadeId) throw new WsException('unidadeId not found');

      this.logger.log(`PDV ${payload.pdvId} status: ${payload.status}`);
      this.server.to(`unidade:${unidadeId}`).emit('pdv:status', {
        ...payload,
        unidadeId,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('tab:open')
  async handleTabOpen(socket: Socket, payload: TabOpenDto) {
    try {
      const userSocket = socket as WsAuthenticatedSocket;
      const { unidadeId } = userSocket.data;
      if (!unidadeId) throw new WsException('unidadeId not found');

      this.logger.log(`Tab ${payload.tabId} opened in mesa ${payload.mesaId}`);
      this.server.to(`unidade:${unidadeId}`).emit('tab:open', payload);
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async broadcastSalesTotal(unidadeId: string, total: number, period: string) {
    this.server.to(`unidade:${unidadeId}`).emit('sales:total', {
      unidadeId,
      total,
      period,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectedPdvCount(unidadeId: string): number {
    return this.connectedPdvSockets.get(unidadeId)?.size || 0;
  }
}
