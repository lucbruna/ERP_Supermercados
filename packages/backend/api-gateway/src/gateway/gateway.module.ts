import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { RateLimitMiddleware } from '../common/rate-limit.middleware';
import { WsProxyMiddleware } from './ws-proxy.middleware';

@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(WsProxyMiddleware)
      .forRoutes({ path: '/socket.io/*', method: RequestMethod.ALL });
  }
}
