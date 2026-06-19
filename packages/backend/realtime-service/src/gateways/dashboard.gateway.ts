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
import { KpiUpdateDto, MetricNewDto, AlertTriggeredDto } from '../dto';

@WebSocketGateway({
  namespace: '/dashboard',
  cors: { origin: '*', credentials: true },
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);

  constructor(private readonly authMiddleware: AuthWsMiddleware) {}

  afterInit(server: Server) {
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('Dashboard gateway auth middleware applied');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Dashboard client connecting: ${socket.id}`);
    const userSocket = socket as WsAuthenticatedSocket;
    const { roles, lojaId, unidadeId } = userSocket.data;

    const isAdmin = roles?.some((r) =>
      ['admin', 'superadmin', 'gerente_geral', 'diretoria'].includes(r),
    );

    if (isAdmin) {
      await socket.join('admin');
      this.logger.log(`Socket ${socket.id} joined admin room`);
    }

    if (unidadeId) {
      await socket.join(`unidade:${unidadeId}`);
    }

    if (lojaId) {
      await socket.join(`loja:${lojaId}`);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Dashboard client disconnecting: ${socket.id}`);
  }

  @SubscribeMessage('kpi:updated')
  async handleKpiUpdated(socket: Socket, payload: KpiUpdateDto) {
    try {
      this.logger.log(`KPI updated: ${payload.metric} = ${payload.value}`);
      this.server.to('admin').emit('kpi:updated', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('metric:new')
  async handleMetricNew(socket: Socket, payload: MetricNewDto) {
    try {
      this.logger.log(`New metric: ${payload.name} = ${payload.value}`);
      this.server.to('admin').emit('metric:new', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('alert:triggered')
  async handleAlertTriggered(socket: Socket, payload: AlertTriggeredDto) {
    try {
      this.logger.warn(`Alert triggered: ${payload.type} (${payload.severity})`);
      this.server.to('admin').emit('alert:triggered', {
        ...payload,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  async broadcastKpiUpdate(payload: KpiUpdateDto) {
    this.server.to('admin').emit('kpi:updated', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastMetric(payload: MetricNewDto) {
    this.server.to('admin').emit('metric:new', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastAlert(payload: AlertTriggeredDto) {
    this.server.to('admin').emit('alert:triggered', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
