import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoCupom } from '@prisma/client';

export class CreateCupomDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty({ enum: TipoCupom })
  @IsEnum(TipoCupom)
  tipo: TipoCupom;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsDateString()
  dataFim: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  usoLimite?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
