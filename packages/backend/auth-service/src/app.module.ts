import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@crm/logging';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MfaModule } from './mfa/mfa.module';
import { SessionModule } from './session/session.module';
import { PermissionModule } from './permission/permission.module';
import { AuditModule } from './audit/audit.module';
import { EmpresaModule } from './empresa/empresa.module';
import { UnidadeModule } from './unidade/unidade.module';
import { PrismaModule } from './common/prisma.module';
import { Oauth2Module } from './oauth2/oauth2.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    PrismaModule,
    AuthModule,
    UserModule,
    MfaModule,
    SessionModule,
    PermissionModule,
    AuditModule,
    EmpresaModule,
    UnidadeModule,
    Oauth2Module,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
