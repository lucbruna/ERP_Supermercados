import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, IsObject } from 'class-validator';
import { EstadoTipo } from '../../common/enums';

export class CreateEstadoDto {
  @ApiProperty() @IsString() nome: string;

  @ApiProperty({ enum: EstadoTipo }) @IsEnum(EstadoTipo) tipo: EstadoTipo;

  @ApiPropertyOptional() @IsOptional() @IsInt() ordem?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() configJson?: Record<string, any>;
}

export class UpdateEstadoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional({ enum: EstadoTipo }) @IsOptional() @IsEnum(EstadoTipo) tipo?: EstadoTipo;

  @ApiPropertyOptional() @IsOptional() @IsInt() ordem?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() configJson?: Record<string, any>;
}
