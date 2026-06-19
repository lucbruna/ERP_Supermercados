import { IsString, IsOptional, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCepDto {
  @ApiProperty({ description: 'CEP com 8 dígitos', example: '01001000' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP deve conter exatamente 8 dígitos' })
  cep: string;

  @ApiProperty({ example: 'Praça da Sé' })
  @IsString()
  @MinLength(3)
  logradouro: string;

  @ApiProperty({ example: 'Sé' })
  @IsString()
  @MinLength(2)
  bairro: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(2)
  cidade: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'Estado deve ter 2 letras maiúsculas' })
  estado: string;

  @ApiPropertyOptional({ example: '3550308' })
  @IsOptional()
  @IsString()
  ibge?: string;
}
