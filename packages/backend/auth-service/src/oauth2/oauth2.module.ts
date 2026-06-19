import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Oauth2Controller } from './oauth2.controller';
import { Oauth2Service } from './oauth2.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
        signOptions: {
          expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600'),
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  controllers: [Oauth2Controller],
  providers: [Oauth2Service],
  exports: [Oauth2Service],
})
export class Oauth2Module {}
