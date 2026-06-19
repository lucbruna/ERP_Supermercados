import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GerarCobrancaDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiProperty()
  @IsString()
  documento: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  valorOriginal: number;

  @ApiProperty()
  @IsDateString()
  dataVencimento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  juros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  multa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class RegistrarAcaoCobrancaDto {
  @ApiProperty()
  @IsString()
  cobrancaId: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'WHATSAPP', 'LIGACAO', 'NEGOCIACAO', 'BOLETO_GERADO'] })
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultado?: string;
}

export class NegociarCobrancaDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  novoValor: number;

  @ApiProperty()
  @IsDateString()
  novoVencimento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  parcelas?: number;
}

export class BaixarCobrancaDto {
  @ApiProperty()
  @IsDateString()
  dataPagamento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valorPago?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}
