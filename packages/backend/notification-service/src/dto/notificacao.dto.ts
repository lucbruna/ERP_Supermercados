import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { TipoNotificacao } from '@prisma/client';

export class CreateNotificacaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
  @ApiProperty({ enum: TipoNotificacao }) @IsEnum(TipoNotificacao) tipo: TipoNotificacao;
  @ApiProperty() @IsString() titulo: string;
  @ApiProperty() @IsString() mensagem: string;
}

export class NotificacaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lida?: string;
}

export class SendNotificacaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty({ enum: TipoNotificacao }) @IsEnum(TipoNotificacao) tipo: TipoNotificacao;
  @ApiProperty() @IsString() destinatario: string;
  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
  @ApiProperty() @IsString() titulo: string;
  @ApiProperty() @IsString() mensagem: string;
}
