import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { TipoSeparacao, Prioridade } from '@prisma/client';

export class CreateSeparacaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() pedidoId: string;
  @ApiProperty({ enum: TipoSeparacao }) @IsEnum(TipoSeparacao) tipo: TipoSeparacao;
  @ApiProperty() @IsArray() itens: any[];
  @ApiProperty() @IsString() separadorId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conferenteId?: string;
  @ApiPropertyOptional({ enum: Prioridade }) @IsOptional() @IsEnum(Prioridade) prioridade?: Prioridade;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateSeparacaoDto {
  @ApiPropertyOptional() @IsOptional() @IsArray() itens?: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() separadorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conferenteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional({ enum: Prioridade }) @IsOptional() @IsEnum(Prioridade) prioridade?: Prioridade;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class SeparacaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() separadorId?: string;
}
