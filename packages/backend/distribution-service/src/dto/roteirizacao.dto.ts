import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { StatusRoteirizacao } from '@prisma/client';

export class CreateRoteirizacaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() origemUnidadeId: string;
  @ApiProperty() @IsArray() entregas: any[];
  @ApiProperty() @IsNumber() distanciaKm: number;
  @ApiProperty() @IsNumber() tempoEstimado: number;
  @ApiProperty() @IsNumber() custoFrete: number;
  @ApiProperty() @IsString() motoristaId: string;
  @ApiProperty() @IsString() veiculoId: string;
  @ApiProperty() @IsDateString() dataSaida: string;
  @ApiProperty() @IsDateString() dataPrevisao: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataChegada?: string;
}

export class UpdateRoteirizacaoDto {
  @ApiPropertyOptional() @IsOptional() @IsArray() entregas?: any[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() distanciaKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() tempoEstimado?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() custoFrete?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() motoristaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataSaida?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataPrevisao?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataChegada?: string;
}

export class OtimizacaoDto {
  @ApiProperty() @IsString() origemUnidadeId: string;
  @ApiProperty() @IsArray() entregas: any[];
  @ApiProperty() @IsString() motoristaId: string;
  @ApiProperty() @IsString() veiculoId: string;
}
