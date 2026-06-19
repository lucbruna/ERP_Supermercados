import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { InstanciaStatus } from '../../common/enums';

export class IniciarInstanciaDto {
  @ApiProperty() @IsString() workflowId: string;

  @ApiProperty() @IsString() entidadeTipo: string;

  @ApiProperty() @IsString() entidadeId: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() dadosJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsString() criadoPor?: string;
}

export class InstanciaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() entidadeTipo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() entidadeId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() workflowId?: string;
}

export class TransitarInstanciaDto {
  @ApiProperty() @IsString() transicaoId: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() dadosJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
}

export class CancelarInstanciaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() motivo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
}
