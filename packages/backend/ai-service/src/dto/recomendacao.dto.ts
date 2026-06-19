import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TipoRecomendacao, PrioridadeRecomendacao } from '@prisma/client';

export class GerarRecomendacaoDto {
  @ApiPropertyOptional({ enum: TipoRecomendacao }) @IsOptional() @IsEnum(TipoRecomendacao) tipo?: TipoRecomendacao;
  @ApiPropertyOptional() @IsOptional() @IsString() produtoId?: string;
}

export class RecomendacaoQueryDto {
  @ApiPropertyOptional({ enum: TipoRecomendacao }) @IsOptional() @IsEnum(TipoRecomendacao) tipo?: TipoRecomendacao;
  @ApiPropertyOptional() @IsOptional() @IsString() prioridade?: string;
}

export class CreateRecomendacaoDto {
  @ApiProperty({ enum: TipoRecomendacao }) @IsEnum(TipoRecomendacao) tipo: TipoRecomendacao;
  @ApiProperty() @IsString() produtoId: string;
  @ApiProperty() @IsString() acao: string;
  @ApiPropertyOptional({ enum: PrioridadeRecomendacao }) @IsOptional() @IsEnum(PrioridadeRecomendacao) prioridade?: PrioridadeRecomendacao;
  @ApiProperty() @IsString() motivo: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() processado?: boolean;
}
