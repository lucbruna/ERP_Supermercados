import { IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalcularCurvaAbcDto {
  @ApiProperty()
  @IsUUID()
  unidadeId: string;

  @ApiProperty()
  @IsNumber()
  mes: number;

  @ApiProperty()
  @IsNumber()
  ano: number;
}

export class CurvaAbcQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ano?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
