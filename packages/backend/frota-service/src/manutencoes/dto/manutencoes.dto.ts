import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoManutencaoEnum {
  PREVENTIVA = 'PREVENTIVA',
  CORRETIVA = 'CORRETIVA',
  REVISAO = 'REVISAO',
}

export enum StatusManutencaoEnum {
  AGENDADA = 'AGENDADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export class CreateManutencaoDto {
  @ApiProperty() @IsUUID() veiculoId: string;
  @ApiProperty() @IsDateString() data: string;
  @ApiProperty({ enum: TipoManutencaoEnum }) @IsEnum(TipoManutencaoEnum) tipo: TipoManutencaoEnum;
  @ApiProperty() @IsString() descricao: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorPecas?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorMaoObra?: number;
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsString() oficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notaFiscal?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataProximaManutencao?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusManutencaoEnum) status?: StatusManutencaoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class UpdateManutencaoDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() data?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(TipoManutencaoEnum) tipo?: TipoManutencaoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() kmAtual?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorPecas?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorMaoObra?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() oficina?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notaFiscal?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataProximaManutencao?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusManutencaoEnum) status?: StatusManutencaoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() observacoes?: string;
}

export class ManutencaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusManutencaoEnum) status?: StatusManutencaoEnum;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}

export class CustosManutencaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dataFim?: string;
}
