import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ServicoCorreios {
  SEDEX = '04014',
  SEDEX_10 = '04790',
  SEDEX_12 = '04782',
  SEDEX_HOJE = '04065',
  PAC = '04510',
  PAC_HOJE = '04804',
}

export class CalcularFreteDto {
  @ApiProperty({ description: 'CEP de origem (apenas dígitos)' })
  @IsString()
  cepOrigem: string;

  @ApiProperty({ description: 'CEP de destino (apenas dígitos)' })
  @IsString()
  cepDestino: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.1)
  peso: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  comprimento: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  altura: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  largura: number;

  @ApiProperty({ enum: ServicoCorreios, default: ServicoCorreios.SEDEX })
  @IsOptional()
  @IsEnum(ServicoCorreios)
  servico?: ServicoCorreios;
}

export class FreteResponseDto {
  @ApiProperty() servico: string;
  @ApiProperty() codigo: string;
  @ApiProperty() valor: number;
  @ApiProperty() prazoDias: number;
  @ApiPropertyOptional() prazoEntrega?: string;
  @ApiPropertyOptional() erro?: string;
}

export class RastrearDto {
  @ApiProperty() @IsString() codigo: string;
}

export class EventoRastreioDto {
  @ApiProperty() data: string;
  @ApiProperty() hora: string;
  @ApiProperty() local: string;
  @ApiPropertyOptional() cidade?: string;
  @ApiPropertyOptional() uf?: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() descricao?: string;
}

export class RastreioResponseDto {
  @ApiProperty() codigo: string;
  @ApiProperty() eventos: EventoRastreioDto[];
  @ApiPropertyOptional() ultimaAtualizacao?: string;
  @ApiPropertyOptional() situacao?: string;
}

export class ConsultarCEPDto {
  @ApiProperty({ description: 'CEP (apenas dígitos)' })
  @IsString()
  cep: string;
}

export class CEPResponseDto {
  @ApiProperty() cep: string;
  @ApiProperty() logradouro: string;
  @ApiPropertyOptional() complemento?: string;
  @ApiProperty() bairro: string;
  @ApiProperty() cidade: string;
  @ApiProperty({ maxLength: 2 }) uf: string;
  @ApiPropertyOptional() ddd?: string;
  @ApiPropertyOptional() ibge?: string;
  @ApiProperty() fonte: string;
}

export class ColetaData {
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() razaoSocial: string;
  @ApiProperty() @IsString() cep: string;
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty() @IsString() uf: string;
  @ApiProperty() @IsString() contatoNome: string;
  @ApiProperty() @IsString() contatoTelefone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contatoEmail?: string;
  @ApiProperty() @IsDateString() dataColeta: string;
  @ApiProperty() @IsString() horaInicial: string;
  @ApiProperty() @IsString() horaFinal: string;
  @ApiProperty() @IsArray() objetos: ColetaObjetoDto[];
}

export class ColetaObjetoDto {
  @ApiProperty() @IsString() descricao: string;
  @ApiProperty() @IsString() servico: string;
  @ApiProperty() @IsNumber() @Min(0.1) peso: number;
  @ApiProperty() @IsNumber() @Min(1) quantidade: number;
}

export class ColetaResponseDto {
  @ApiProperty() solicitacao: string;
  @ApiProperty() status: string;
  @ApiProperty() dataAgendada: string;
  @ApiPropertyOptional() observacao?: string;
}

export class FreteCacheEntry {
  chave: string;
  servico: string;
  valor: number;
  prazo: number;
  timestamp: number;
}
