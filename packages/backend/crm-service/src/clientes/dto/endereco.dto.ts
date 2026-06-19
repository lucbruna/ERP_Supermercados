import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { TipoEndereco } from '@prisma/client';

export class CreateEnderecoDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty({ enum: TipoEndereco })
  @IsEnum(TipoEndereco)
  tipo: TipoEndereco;

  @ApiProperty()
  @IsString()
  cep: string;

  @ApiProperty()
  @IsString()
  logradouro: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty()
  @IsString()
  bairro: string;

  @ApiProperty()
  @IsString()
  cidade: string;

  @ApiProperty()
  @IsString()
  estado: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export class UpdateEnderecoDto extends PartialType(
  OmitType(CreateEnderecoDto, ['clienteId'] as const),
) {}
