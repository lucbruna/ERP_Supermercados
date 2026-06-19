import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateMotoristaDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() cnh: string;
  @ApiProperty() @IsString() categoriaCNH: string;
  @ApiProperty() @IsDateString() validadeCNH: string;
  @ApiProperty() @IsString() celular: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateMotoristaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cpf?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnh?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoriaCNH?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validadeCNH?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() celular?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
