import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecrutamentoStatus, CandidatoStatus } from '@prisma/client';

export class CreateRecrutamentoDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsString()
  cargo: string;

  @ApiProperty()
  @IsString()
  departamento: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  requisitos?: string[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioMin: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioMax: number;

  @ApiPropertyOptional({ enum: RecrutamentoStatus })
  @IsOptional()
  @IsEnum(RecrutamentoStatus)
  status?: RecrutamentoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataAbertura?: string;
}

export class UpdateRecrutamentoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  requisitos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioMax?: number;

  @ApiPropertyOptional({ enum: RecrutamentoStatus })
  @IsOptional()
  @IsEnum(RecrutamentoStatus)
  status?: RecrutamentoStatus;
}

export class RecrutamentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({ enum: RecrutamentoStatus })
  @IsOptional()
  @IsEnum(RecrutamentoStatus)
  status?: RecrutamentoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateCandidatoDto {
  @ApiProperty()
  @IsUUID()
  recrutamentoId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  celular: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  curriculoUrl?: string;

  @ApiPropertyOptional({ enum: CandidatoStatus })
  @IsOptional()
  @IsEnum(CandidatoStatus)
  status?: CandidatoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  etapas?: any[];
}

export class UpdateCandidatoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  curriculoUrl?: string;

  @ApiPropertyOptional({ enum: CandidatoStatus })
  @IsOptional()
  @IsEnum(CandidatoStatus)
  status?: CandidatoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  etapas?: any[];
}
