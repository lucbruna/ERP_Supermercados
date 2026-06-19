import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreinamentoStatus, TreinamentoFuncionarioStatus } from '@prisma/client';

export class CreateTreinamentoDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsDateString()
  dataFim: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  cargaHoraria: number;

  @ApiProperty()
  @IsString()
  instrutor: string;

  @ApiPropertyOptional({ enum: TreinamentoStatus })
  @IsOptional()
  @IsEnum(TreinamentoStatus)
  status?: TreinamentoStatus;
}

export class UpdateTreinamentoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  cargaHoraria?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instrutor?: string;

  @ApiPropertyOptional({ enum: TreinamentoStatus })
  @IsOptional()
  @IsEnum(TreinamentoStatus)
  status?: TreinamentoStatus;
}

export class TreinamentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instrutor?: string;

  @ApiPropertyOptional({ enum: TreinamentoStatus })
  @IsOptional()
  @IsEnum(TreinamentoStatus)
  status?: TreinamentoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class VincularFuncionarioDto {
  @ApiProperty()
  @IsUUID()
  treinamentoId: string;

  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiPropertyOptional({ enum: TreinamentoFuncionarioStatus })
  @IsOptional()
  @IsEnum(TreinamentoFuncionarioStatus)
  status?: TreinamentoFuncionarioStatus;
}

export class UpdateVinculoDto {
  @ApiPropertyOptional({ enum: TreinamentoFuncionarioStatus })
  @IsOptional()
  @IsEnum(TreinamentoFuncionarioStatus)
  status?: TreinamentoFuncionarioStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  nota?: number;
}
