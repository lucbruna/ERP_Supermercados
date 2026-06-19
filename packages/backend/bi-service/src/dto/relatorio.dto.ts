import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { TipoRelatorio, FrequenciaRelatorio } from '@prisma/client';

export class CreateRelatorioDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() nome: string;
  @ApiPropertyOptional({ enum: TipoRelatorio }) @IsOptional() @IsEnum(TipoRelatorio) tipo?: TipoRelatorio;
  @ApiPropertyOptional() @IsOptional() parametros?: any;
  @ApiProperty() @IsString() criadoPor: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() agendado?: boolean;
  @ApiPropertyOptional({ enum: FrequenciaRelatorio }) @IsOptional() @IsEnum(FrequenciaRelatorio) frequencia?: FrequenciaRelatorio;
}

export class UpdateRelatorioDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional({ enum: TipoRelatorio }) @IsOptional() @IsEnum(TipoRelatorio) tipo?: TipoRelatorio;
  @ApiPropertyOptional() @IsOptional() parametros?: any;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() agendado?: boolean;
  @ApiPropertyOptional({ enum: FrequenciaRelatorio }) @IsOptional() @IsEnum(FrequenciaRelatorio) frequencia?: FrequenciaRelatorio;
}

export class GerarRelatorioDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiPropertyOptional() @IsOptional() parametros?: any;
  @ApiPropertyOptional() @IsOptional() @IsArray() filtros?: string[];
}
