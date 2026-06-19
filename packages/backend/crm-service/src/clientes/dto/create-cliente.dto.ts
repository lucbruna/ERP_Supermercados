import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsArray, IsBoolean, IsObject, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SegmentoCliente } from '@prisma/client';

export class CreateClienteDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, { message: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos' })
  cpfCnpj: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  celular: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  endereco?: Record<string, any>;

  @ApiPropertyOptional({ enum: SegmentoCliente, default: 'POTENCIAL' })
  @IsOptional()
  @IsEnum(SegmentoCliente)
  segmento?: SegmentoCliente;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferencias?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
