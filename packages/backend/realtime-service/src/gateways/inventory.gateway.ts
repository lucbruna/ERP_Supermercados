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
import { StockLowDto, StockOutDto, TransferIncomingDto, PriceChangedDto } from '../dto';

@WebSocketGateway({
  namespace: '/inventory',
  cors: { origin: '*', credentials: true },
})
export class InventoryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InventoryGateway.name);

  constructor(private readonly authMiddleware: AuthWsMiddleware) {}

  afterInit(server: Server) {
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('Inventory gateway auth middleware applied');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Inventory client connecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { unidadeId, lojaId, roles, permissions } = userSocket.data;

    if (unidadeId) {
      await socket.join(`unidade:${unidadeId}`);
    }

    if (lojaId) {
      await socket.join(`loja:${lojaId}`);
    }

    const departamentoPerms = (permissions || [])
      .filter((p: string) => p.startsWith('departamento:'))
      .map((p: string) => p.split(':')[1]);

    for (const depId of departamentoPerms) {
      await socket.join(`departamento:${depId}`);
      this.logger.log(`Socket ${socket.id} joined departamento:${depId}`);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Inventory client disconnecting: ${socket.id}`);
  }

  @SubscribeMessage('stock:low')
  async handleStockLow(socket: Socket, payload: StockLowDto) {
    try {
      this.logger.warn(`Stock low: ${payload.productName} (${payload.currentStock}/${payload.minimumStock})`);
      this.server.to(`departamento:${payload.departamentoId}`).emit('stock:low', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('stock:out')
  async handleStockOut(socket: Socket, payload: StockOutDto) {
    try {
      this.logger.warn(`Stock out: ${payload.productName}`);
      this.server.to(`departamento:${payload.departamentoId}`).emit('stock:out', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('transfer:incoming')
  async handleTransferIncoming(socket: Socket, payload: TransferIncomingDto) {
    try {
      this.logger.log(`Transfer incoming: ${payload.productName} x${payload.quantity}`);
      this.server.to(`unidade:${payload.toUnidadeId}`).emit('transfer:incoming', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('price:changed')
  async handlePriceChanged(socket: Socket, payload: PriceChangedDto) {
    try {
      this.logger.log(`Price changed: ${payload.productName} ${payload.oldPrice} -> ${payload.newPrice}`);

      if (payload.departamentoId) {
        this.server.to(`departamento:${payload.departamentoId}`).emit('price:changed', {
          ...payload,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.server.emit('price:changed', {
          ...payload,
          timestamp: new Date().toISOString(),
        });
      }

      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async broadcastStockLow(payload: StockLowDto) {
    this.server.to(`departamento:${payload.departamentoId}`).emit('stock:low', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastTransferIncoming(payload: TransferIncomingDto) {
    this.server.to(`unidade:${payload.toUnidadeId}`).emit('transfer:incoming', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
