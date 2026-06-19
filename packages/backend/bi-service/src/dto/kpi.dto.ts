import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { CategoriaKPI, PeriodoKPI } from '@prisma/client';

export class CreateKpiDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unidadeId?: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty({ enum: CategoriaKPI }) @IsEnum(CategoriaKPI) categoria: CategoriaKPI;
  @ApiProperty() @IsNumber() valor: number;
  @ApiProperty() @IsNumber() meta: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() variacao?: number;
  @ApiProperty({ enum: PeriodoKPI }) @IsEnum(PeriodoKPI) periodo: PeriodoKPI;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataReferencia?: string;
}

export class UpdateKpiDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional({ enum: CategoriaKPI }) @IsOptional() @IsEnum(CategoriaKPI) categoria?: CategoriaKPI;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valor?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() meta?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() variacao?: number;
  @ApiPropertyOptional({ enum: PeriodoKPI }) @IsOptional() @IsEnum(PeriodoKPI) periodo?: PeriodoKPI;
}

export class KpiQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoria?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unidadeId?: string;
}
