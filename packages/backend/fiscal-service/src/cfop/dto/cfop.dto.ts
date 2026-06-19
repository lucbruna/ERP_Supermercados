import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCfopDto {
  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aplicacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class UpdateCfopDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aplicacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class CfopQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
