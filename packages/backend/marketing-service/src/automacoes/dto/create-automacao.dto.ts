import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutomacaoGatilho, AutomacaoAcao } from '@prisma/client';

export class CreateAutomacaoDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: AutomacaoGatilho })
  @IsEnum(AutomacaoGatilho)
  gatilho: AutomacaoGatilho;

  @ApiProperty({ enum: AutomacaoAcao })
  @IsEnum(AutomacaoAcao)
  acao: AutomacaoAcao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  modeloMensagemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  parametros?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateAutomacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: AutomacaoGatilho })
  @IsOptional()
  @IsEnum(AutomacaoGatilho)
  gatilho?: AutomacaoGatilho;

  @ApiPropertyOptional({ enum: AutomacaoAcao })
  @IsOptional()
  @IsEnum(AutomacaoAcao)
  acao?: AutomacaoAcao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  modeloMensagemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  parametros?: Record<string, any>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class AutomacaoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AutomacaoGatilho })
  @IsOptional()
  @IsEnum(AutomacaoGatilho)
  gatilho?: AutomacaoGatilho;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
