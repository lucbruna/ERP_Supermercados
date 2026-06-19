import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PdvGateway } from './gateways/pdv.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { DashboardGateway } from './gateways/dashboard.gateway';
import { InventoryGateway } from './gateways/inventory.gateway';
import { RhGateway } from './gateways/rh.gateway';
import { AuthWsMiddleware } from './services/auth-ws.middleware';
import { RedisAdapterService } from './services/redis-adapter.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supermercado-jwt-secret-key'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    AuthWsMiddleware,
    RedisAdapterService,
    PdvGateway,
    NotificationsGateway,
    DashboardGateway,
    InventoryGateway,
    RhGateway,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [
    AuthWsMiddleware,
    RedisAdapterService,
    PdvGateway,
    NotificationsGateway,
    DashboardGateway,
    InventoryGateway,
    RhGateway,
  ],
})
export class AppModule {}
