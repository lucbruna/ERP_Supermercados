import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StatusArquivoEnum {
  ARMAZENADO = 'ARMAZENADO',
  PROCESSANDO = 'PROCESSANDO',
  ERRO = 'ERRO',
  DELETADO = 'DELETADO',
}

export enum ProvedorEnum {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  AZURE = 'AZURE',
  GCS = 'GCS',
}

export class FiltrarArquivosDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extensao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StatusArquivoEnum })
  @IsOptional()
  @IsEnum(StatusArquivoEnum)
  status?: StatusArquivoEnum;

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
}

export class AtualizarArquivoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class MoverArquivoDto {
  @ApiProperty({ description: 'Caminho da pasta destino' })
  @IsString()
  pastaDestino: string;
}
