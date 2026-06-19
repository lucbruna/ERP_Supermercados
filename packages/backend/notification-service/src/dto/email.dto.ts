import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendEmailDto {
  @ApiProperty() @IsString() to: string;
  @ApiProperty() @IsString() subject: string;
  @ApiPropertyOptional() @IsOptional() @IsString() template?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() context?: Record<string, any>;
}

export class TestEmailDto {
  @ApiPropertyOptional() @IsOptional() @IsString() to?: string;
}
