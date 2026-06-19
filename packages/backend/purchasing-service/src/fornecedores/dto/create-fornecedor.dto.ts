import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class EnderecoDto {
  @ApiProperty() @IsString() @IsNotEmpty() logradouro: string;
  @ApiProperty() @IsString() @IsNotEmpty() numero: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() @IsNotEmpty() bairro: string;
  @ApiProperty() @IsString() @IsNotEmpty() cidade: string;
  @ApiProperty() @IsString() @IsNotEmpty() uf: string;
  @ApiProperty() @IsString() @IsNotEmpty() cep: string;
}

class ContatoDto {
  @ApiProperty() @IsString() @IsNotEmpty() nome: string;
  @ApiProperty() @IsString() @IsNotEmpty() cargo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() celular?: string;
}

class BancoInfoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() banco?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() agencia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conta?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pix?: string;
}

export class CreateFornecedorDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyId: string;
  @ApiProperty() @IsString() @IsNotEmpty() cnpj: string;
  @ApiProperty() @IsString() @IsNotEmpty() razaoSocial: string;
  @ApiProperty() @IsString() @IsNotEmpty() nomeFantasia: string;
  @ApiPropertyOptional() @IsOptional() @IsString() inscricaoEstadual?: string;

  @ApiProperty() @ValidateNested() @Type(() => EnderecoDto) endereco: EnderecoDto;
  @ApiProperty() @ValidateNested() @Type(() => ContatoDto) contato: ContatoDto;

  @ApiProperty() @IsEmail() @IsNotEmpty() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() celular: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;

  @ApiProperty() @IsInt() @Min(0) prazoEntregaDias: number;
  @ApiProperty() @IsString() @IsNotEmpty() condicaoPagamento: string;

  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => BancoInfoDto) bancoInfo?: BancoInfoDto;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
