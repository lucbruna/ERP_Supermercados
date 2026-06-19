import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsIP } from 'class-validator';

export class CriarBloqueioDto {
  @ApiProperty()
  @IsIP()
  ip: string;

  @ApiProperty()
  @IsString()
  motivo: string;

  @ApiProperty()
  @IsString()
  criadoPor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class AtualizarBloqueioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
