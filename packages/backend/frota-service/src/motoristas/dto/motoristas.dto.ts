import { IsString, IsEnum, IsOptional, IsDateString, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SituacaoMotoristaEnum {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  FERIAS = 'FERIAS',
}

export class CreateMotoristaDto {
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() cnh: string;
  @ApiProperty() @IsString() categoriaCnh: string;
  @ApiProperty() @IsDateString() validadeCnh: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataExame?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoMotoristaEnum) situacao?: SituacaoMotoristaEnum;
}

export class UpdateMotoristaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnh?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoriaCnh?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validadeCnh?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataExame?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoMotoristaEnum) situacao?: SituacaoMotoristaEnum;
}

export class MotoristaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SituacaoMotoristaEnum) situacao?: SituacaoMotoristaEnum;
  @ApiPropertyOptional() @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}
