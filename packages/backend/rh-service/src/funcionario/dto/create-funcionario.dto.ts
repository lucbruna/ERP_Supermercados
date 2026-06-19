import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, IsArray, ValidateNested, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FuncionarioStatus } from '@prisma/client';

export class CreateFuncionarioDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsUUID()
  unidadeId: string;

  @ApiProperty()
  @IsString()
  matricula: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  celular: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foto?: string;

  @ApiProperty()
  @IsDateString()
  dataAdmissao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataDemissao?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salario: number;

  @ApiProperty()
  @IsString()
  cargo: string;

  @ApiProperty()
  @IsString()
  departamento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  setor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  jornadaTrabalho?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dadosBancarios?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  documentos?: any[];

  @ApiPropertyOptional({ enum: FuncionarioStatus })
  @IsOptional()
  @IsEnum(FuncionarioStatus)
  status?: FuncionarioStatus;
}

export class UpdateFuncionarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  foto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataDemissao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salario?: number;

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
  setor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  jornadaTrabalho?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dadosBancarios?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  documentos?: any[];

  @ApiPropertyOptional({ enum: FuncionarioStatus })
  @IsOptional()
  @IsEnum(FuncionarioStatus)
  status?: FuncionarioStatus;
}

export class FuncionarioQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional({ enum: FuncionarioStatus })
  @IsOptional()
  @IsEnum(FuncionarioStatus)
  status?: FuncionarioStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
