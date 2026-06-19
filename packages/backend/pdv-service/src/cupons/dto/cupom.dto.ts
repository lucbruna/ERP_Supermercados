import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CupomTipo {
  PERCENTUAL = 'PERCENTUAL',
  FIXO = 'FIXO',
}

export class ValidarCupomDto {
  @ApiProperty({ example: 'DESC10' })
  @IsString()
  codigo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional({ example: 100.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  produtosIds?: string[];
}

export class AplicarCupomDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  vendaId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;
}

export class CreateCupomDto {
  @ApiProperty({ example: 'DESC10' })
  @IsString()
  codigo: string;

  @ApiProperty({ enum: CupomTipo })
  @IsEnum(CupomTipo)
  tipo: CupomTipo;

  @ApiProperty({ example: 10.00 })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorMinimo?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  produtosIds?: string[];

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usoLimite?: number;

  @ApiPropertyOptional()
  @IsOptional()
  dataValidade?: Date;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class CupomQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
