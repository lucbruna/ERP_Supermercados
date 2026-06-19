import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StatusRotaEnum {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export class CreateRotaDto {
  @ApiProperty() @IsString() descricao: string;
  @ApiProperty() @IsUUID() veiculoId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() motoristaId?: string;
  @ApiProperty() @IsString() origem: string;
  @ApiProperty() @IsString() destino: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) distanciaKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataSaida?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataChegada?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusRotaEnum) status?: StatusRotaEnum;
}

export class UpdateRotaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() motoristaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() origem?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destino?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) distanciaKm?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataSaida?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataChegada?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusRotaEnum) status?: StatusRotaEnum;
}

export class ConcluirRotaDto {
  @ApiProperty() @IsNumber() @Min(0) kmFinal: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataChegada?: string;
}

export class RotaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() veiculoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() motoristaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(StatusRotaEnum) status?: StatusRotaEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
