import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  ALL = 'all',
}

export class NotifyDto {
  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional() @IsOptional() @IsString() to?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() token?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() template?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() context?: Record<string, any>;
}
