import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsInt } from 'class-validator';
import { StatusVeiculo } from '@prisma/client';

export class CreateVeiculoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() placa: string;
  @ApiProperty() @IsString() modelo: string;
  @ApiProperty() @IsInt() ano: number;
  @ApiProperty() @IsNumber() capacidadeKg: number;
  @ApiProperty() @IsNumber() capacidadeM3: number;
  @ApiProperty() @IsString() tipo: string;
  @ApiPropertyOptional({ enum: StatusVeiculo }) @IsOptional() @IsEnum(StatusVeiculo) status?: StatusVeiculo;
}

export class UpdateVeiculoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() placa?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() modelo?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() ano?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() capacidadeM3?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional({ enum: StatusVeiculo }) @IsOptional() @IsEnum(StatusVeiculo) status?: StatusVeiculo;
}
