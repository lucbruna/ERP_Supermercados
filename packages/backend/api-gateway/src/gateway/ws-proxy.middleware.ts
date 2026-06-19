import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as httpProxy from 'http-proxy-middleware';

@Injectable()
export class WsProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WsProxyMiddleware.name);
  private proxy: ReturnType<typeof httpProxy.createProxyMiddleware>;

  constructor() {
    const target = process.env.REALTIME_SERVICE_URL || 'http://realtime-service:3021';
    this.proxy = httpProxy.createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    });

    const proxyEvents = this.proxy as any;
    proxyEvents.on('proxyReq', (_proxyReq: any, req: any) => {
      this.logger.log(`Proxying WebSocket HTTP request to ${target}${req.url}`);
    });
    proxyEvents.on('proxyReqWs', (_proxyReq: any, req: any) => {
      this.logger.log(`Proxying WebSocket upgrade to ${target}${req.url}`);
    });
    proxyEvents.on('error', (err: Error, req: any) => {
      this.logger.error(`WebSocket proxy error: ${err.message}`);
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.startsWith('/socket.io/')) {
      return this.proxy(req, res, next);
    }
    next();
  }
}
