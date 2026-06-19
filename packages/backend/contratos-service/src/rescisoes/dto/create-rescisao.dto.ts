import { IsString, IsOptional, IsDateString, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RescisaoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoRescisao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contratoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class RescisaoRelatorioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
