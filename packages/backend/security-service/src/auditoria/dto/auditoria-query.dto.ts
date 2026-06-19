import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoAuditoria {
  ACESSO = 'ACESSO',
  ALTERACAO = 'ALTERACAO',
  EXCLUSAO = 'EXCLUSAO',
  LOGIN = 'LOGIN',
  FRAUDE = 'FRAUDE',
}

export enum GravidadeAuditoria {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export class AuditoriaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ enum: TipoAuditoria })
  @IsOptional()
  @IsEnum(TipoAuditoria)
  tipo?: TipoAuditoria;

  @ApiPropertyOptional({ enum: GravidadeAuditoria })
  @IsOptional()
  @IsEnum(GravidadeAuditoria)
  gravidade?: GravidadeAuditoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class AuditoriaExportDto {
  @ApiPropertyOptional({ enum: TipoAuditoria })
  @IsOptional()
  @IsEnum(TipoAuditoria)
  tipo?: TipoAuditoria;

  @ApiPropertyOptional({ enum: GravidadeAuditoria })
  @IsOptional()
  @IsEnum(GravidadeAuditoria)
  gravidade?: GravidadeAuditoria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recurso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
