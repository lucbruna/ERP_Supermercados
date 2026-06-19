import { IsString, IsNumber, IsOptional, IsEnum, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CartaoInfoDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  numero: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  mesVencimento: number;

  @ApiProperty({ example: 2028 })
  @IsNumber()
  anoVencimento: number;

  @ApiProperty({ example: '123' })
  @IsString()
  codigoSeguranca: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nomeTitular: string;

  @ApiProperty({ example: 'visa' })
  @IsString()
  bandeira: string;
}

class EnderecoDto {
  @ApiProperty({ example: '01001000' })
  @IsString()
  cep: string;

  @ApiProperty({ example: 'Rua Exemplo' })
  @IsString()
  logradouro: string;

  @ApiProperty({ example: '123' })
  @IsString()
  numero: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  bairro: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  cidade: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  estado: string;
}

class ClienteInfoDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome: string;

  @ApiProperty({ example: '12345678909' })
  @IsString()
  documento: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ type: EnderecoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;
}

export class ProcessarPagamentoDto {
  @ApiProperty({ example: 150.50 })
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parcelas?: number;

  @ApiPropertyOptional({ type: CartaoInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CartaoInfoDto)
  cartaoInfo?: CartaoInfoDto;

  @ApiPropertyOptional({ type: ClienteInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClienteInfoDto)
  clienteInfo?: ClienteInfoDto;

  @ApiPropertyOptional({ example: 'Compra de mercadorias' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ enum: ['CREDITO', 'DEBITO', 'PIX', 'BOLETO'] })
  @IsEnum(['CREDITO', 'DEBITO', 'PIX', 'BOLETO'])
  tipoPagamento: 'CREDITO' | 'DEBITO' | 'PIX' | 'BOLETO';
}
