import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCodigoBarras } from '@prisma/client';

export class GerarCodigoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty({ enum: TipoCodigoBarras, default: 'EAN13' })
  @IsEnum(TipoCodigoBarras)
  tipo: TipoCodigoBarras;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  ePrimario?: boolean;
}

export class ValidarCodigoDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty({ enum: TipoCodigoBarras })
  @IsEnum(TipoCodigoBarras)
  tipo: TipoCodigoBarras;
}

export class ImagemCodigoDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty({ enum: TipoCodigoBarras, default: 'CODE128' })
  @IsEnum(TipoCodigoBarras)
  tipo: TipoCodigoBarras;

  @ApiPropertyOptional({ default: 'png' })
  @IsOptional()
  @IsString()
  formato?: string;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @IsNumber()
  largura?: number;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsNumber()
  altura?: number;
}
