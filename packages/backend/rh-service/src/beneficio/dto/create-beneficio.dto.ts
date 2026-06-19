import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBeneficioDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UpdateBeneficioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class BeneficioQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class VincularBeneficioDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsUUID()
  beneficioId: string;
}
