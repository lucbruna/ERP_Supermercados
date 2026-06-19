import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPix, StatusPix } from '@prisma/client';

export class CreatePixDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  contaBancariaId: string;

  @ApiProperty({ enum: TipoPix })
  @IsEnum(TipoPix)
  tipo: TipoPix;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  chavePix: string;

  @ApiProperty()
  @IsNumber()
  valor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: StatusPix, default: 'PENDENTE' })
  @IsOptional()
  @IsEnum(StatusPix)
  status?: StatusPix;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  txid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qrCodeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  copiaCola?: string;

  @ApiProperty()
  @IsDateString()
  dataTransacao: string;
}

export class UpdatePixDto {
  @ApiPropertyOptional({ enum: StatusPix })
  @IsOptional()
  @IsEnum(StatusPix)
  status?: StatusPix;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  txid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qrCodeUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  copiaCola?: string;
}

export class QueryPixDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contaBancariaId?: string;

  @ApiPropertyOptional({ enum: TipoPix })
  @IsOptional()
  @IsEnum(TipoPix)
  tipo?: TipoPix;

  @ApiPropertyOptional({ enum: StatusPix })
  @IsOptional()
  @IsEnum(StatusPix)
  status?: StatusPix;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  pagina?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  limite?: number;
}
