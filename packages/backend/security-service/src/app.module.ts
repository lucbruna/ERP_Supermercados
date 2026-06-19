import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { PrismaModule } from './common/prisma.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RegrasModule } from './regras/regras.module';
import { BloqueioModule } from './bloqueio/bloqueio.module';
import { LgpdModule } from './lgpd/lgpd.module';
import { JobsModule } from './jobs/jobs.module';
import { LgpdDashboardModule } from './dashboard/lgpd-dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditoriaModule,
    RegrasModule,
    BloqueioModule,
    LgpdModule,
    JobsModule,
    LgpdDashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
