import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { AcaoTipo } from '../../common/enums';

export class CreateAcaoDto {
  @ApiProperty() @IsString() nome: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiProperty({ enum: AcaoTipo }) @IsEnum(AcaoTipo) tipo: AcaoTipo;

  @ApiPropertyOptional() @IsOptional() @IsObject() configJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateAcaoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiPropertyOptional({ enum: AcaoTipo }) @IsOptional() @IsEnum(AcaoTipo) tipo?: AcaoTipo;

  @ApiPropertyOptional() @IsOptional() @IsObject() configJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class ExecutarAcaoDto {
  @ApiPropertyOptional() @IsOptional() @IsObject() params?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsString() instanciaId?: string;
}
