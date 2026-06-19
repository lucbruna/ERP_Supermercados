import { IsNumber, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GerarSugestoesDto {
  @ApiProperty()
  @IsUUID()
  unidadeId: string;
}

export class SugestaoCompraQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  processada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
