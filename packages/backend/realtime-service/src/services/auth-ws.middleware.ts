import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

export interface WsAuthenticatedSocket extends Socket {
  data: {
    userId: string;
    lojaId?: string;
    unidadeId?: string;
    roles: string[];
    permissions: string[];
    [key: string]: any;
  };
}

@Injectable()
export class AuthWsMiddleware {
  private readonly logger = new Logger(AuthWsMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  createMiddleware() {
    return async (socket: Socket, next: (err?: Error) => void) => {
      try {
        const token = this.extractToken(socket);
        if (!token) {
          throw new WsException('Authentication required');
        }

        const payload = await this.jwtService.verifyAsync(token);
        socket.data.userId = payload.sub || payload.userId;
        socket.data.lojaId = payload.lojaId;
        socket.data.unidadeId = payload.unidadeId;
        socket.data.roles = payload.roles || [];
        socket.data.permissions = payload.permissions || [];
        socket.data.email = payload.email;
        socket.data.name = payload.name;

        this.logger.log(`Authenticated socket: user=${socket.data.userId}, roles=[${socket.data.roles.join(',')}]`);
        next();
      } catch (error) {
        this.logger.warn(`WebSocket auth failed: ${error.message}`);
        next(new UnauthorizedException('Invalid or expired token'));
      }
    };
  }

  private extractToken(socket: Socket): string | null {
    const auth = socket.handshake.auth?.token;
    if (auth) return auth;

    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const queryToken = socket.handshake.query?.token as string;
    if (queryToken) return queryToken;

    return null;
  }
}
