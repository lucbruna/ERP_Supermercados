import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { CategoriaKPI, FormatoIndicador } from '@prisma/client';

export class CreateIndicadorDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty({ enum: CategoriaKPI }) @IsEnum(CategoriaKPI) categoria: CategoriaKPI;
  @ApiProperty() query: any;
  @ApiPropertyOptional({ enum: FormatoIndicador }) @IsOptional() @IsEnum(FormatoIndicador) formato?: FormatoIndicador;
  @ApiPropertyOptional() @IsOptional() @IsInt() atualizacaoSegundos?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateIndicadorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional({ enum: CategoriaKPI }) @IsOptional() @IsEnum(CategoriaKPI) categoria?: CategoriaKPI;
  @ApiPropertyOptional() @IsOptional() query?: any;
  @ApiPropertyOptional({ enum: FormatoIndicador }) @IsOptional() @IsEnum(FormatoIndicador) formato?: FormatoIndicador;
  @ApiPropertyOptional() @IsOptional() @IsInt() atualizacaoSegundos?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
