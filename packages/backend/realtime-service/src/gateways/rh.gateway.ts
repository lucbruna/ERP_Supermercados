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
import { PontoRegisteredDto, PontoAlertDto, BiometricoAlertDto } from '../dto';

@WebSocketGateway({
  namespace: '/rh',
  cors: { origin: '*', credentials: true },
})
export class RhGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RhGateway.name);

  constructor(private readonly authMiddleware: AuthWsMiddleware) {}

  afterInit(server: Server) {
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('RH gateway auth middleware applied');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`RH client connecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { roles, unidadeId, lojaId } = userSocket.data;

    const isHrTeam = roles?.some((r) =>
      ['rh', 'rh_admin', 'diretoria_rh', 'admin', 'superadmin'].includes(r),
    );

    if (isHrTeam) {
      await socket.join('rh_team');
      this.logger.log(`Socket ${socket.id} joined rh_team room`);

      if (unidadeId) {
        await socket.join(`rh_unidade:${unidadeId}`);
      }
      if (lojaId) {
        await socket.join(`rh_loja:${lojaId}`);
      }
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`RH client disconnecting: ${socket.id}`);
  }

  @SubscribeMessage('ponto:registered')
  async handlePontoRegistered(socket: Socket, payload: PontoRegisteredDto) {
    try {
      this.logger.log(`Ponto registered: ${payload.colaboradorName} - ${payload.tipo}`);
      this.server.to('rh_team').emit('ponto:registered', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true, pontoId: payload.id };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('ponto:alert')
  async handlePontoAlert(socket: Socket, payload: PontoAlertDto) {
    try {
      this.logger.warn(`Ponto alert: ${payload.colaboradorName} - ${payload.tipo}`);
      this.server.to('rh_team').emit('ponto:alert', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('biometrico:alert')
  async handleBiometricoAlert(socket: Socket, payload: BiometricoAlertDto) {
    try {
      this.logger.warn(`Biometrico alert: ${payload.dispositivoName} - ${payload.status}`);
      const targetRoom = payload.unidadeId
        ? `rh_unidade:${payload.unidadeId}`
        : 'rh_team';
      this.server.to(targetRoom).emit('biometrico:alert', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async broadcastPontoRegistered(payload: PontoRegisteredDto) {
    this.server.to('rh_team').emit('ponto:registered', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastPontoAlert(payload: PontoAlertDto) {
    this.server.to('rh_team').emit('ponto:alert', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
