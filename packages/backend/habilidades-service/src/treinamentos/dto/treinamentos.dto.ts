import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreinamentoModalidade, TurmaStatus } from '@prisma/client';

export class CreateTreinamentoDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  cargaHoraria: number;

  @ApiPropertyOptional({ enum: TreinamentoModalidade })
  @IsOptional()
  @IsEnum(TreinamentoModalidade)
  modalidade?: TreinamentoModalidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conteudo?: string;
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
  @IsNumber()
  @Min(1)
  cargaHoraria?: number;

  @ApiPropertyOptional({ enum: TreinamentoModalidade })
  @IsOptional()
  @IsEnum(TreinamentoModalidade)
  modalidade?: TreinamentoModalidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conteudo?: string;
}

export class TreinamentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: TreinamentoModalidade })
  @IsOptional()
  @IsEnum(TreinamentoModalidade)
  modalidade?: TreinamentoModalidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateTurmaDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instrutor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  vagas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class UpdateTurmaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

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
  @IsString()
  horario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instrutor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  vagas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TurmaStatus)
  status?: TurmaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class InscreverFuncionarioDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  frequencia?: number;
}

export class RegistrarPresencaDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  frequencia: number;
}
