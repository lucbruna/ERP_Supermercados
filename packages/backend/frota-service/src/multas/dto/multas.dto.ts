import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StatusMultaEnum {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  RECORRENDO = 'RECORRENDO',
}

export class CreateMultaDto {
  @ApiProperty() @IsUUID() veiculoId: string;
  @ApiProperty() @IsDateString() data: string;
  @ApiProperty() @IsString() orgao: string;
  @ApiProperty() @IsString() infracao: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pontuacao?: number;
  @ApiProperty() @IsNumber() @Min(0) valor: number;
  @ApiPropertyOptional() @IsOptional() @IsString() local?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusMultaEnum) status?: StatusMultaEnum;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataPagamento?: string;
}

export class UpdateMultaDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() data?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() orgao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() infracao?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pontuacao?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valor?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() local?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusMultaEnum) status?: StatusMultaEnum;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataPagamento?: string;
}

export class PagarMultaDto {
  @ApiProperty() @IsDateString() dataPagamento: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valor?: number;
}

export class MultaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusMultaEnum) status?: StatusMultaEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
