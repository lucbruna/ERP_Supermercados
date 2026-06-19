import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendPushDto {
  @ApiPropertyOptional() @IsOptional() @IsString() token?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() topic?: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() body: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() data?: Record<string, string>;
}
