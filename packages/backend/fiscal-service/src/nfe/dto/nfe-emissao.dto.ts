import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NfeItemDto {
  @ApiProperty() @IsString() codigoProduto: string;
  @ApiProperty() @IsString() descricao: string;
  @ApiProperty() @IsString() ncm: string;
  @ApiProperty() @IsString() cfop: string;
  @ApiProperty() @IsString() unidade: string;
  @ApiProperty() @IsNumber() @Min(0) quantidade: number;
  @ApiProperty() @IsNumber() @Min(0) valorUnitario: number;
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorDesconto?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() cstICMS?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() csosn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cest?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() aliquotaICMS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseICMS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorICMS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorIPI?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorPIS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorCOFINS?: number;
}

export class EmitirNfeDto {
  @ApiProperty() @IsString() empresaFiscalId: string;
  @ApiProperty() @IsNumber() numero: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() serie?: number;
  @ApiProperty({ enum: ['NFe', 'NFCe', 'CTe', 'MDFe'] }) @IsString() tipo: string;
  @ApiPropertyOptional({ default: 55 }) @IsOptional() @IsNumber() modelo?: number;
  @ApiProperty() @IsString() naturezaOperacao: string;
  @ApiProperty() @IsString() emitenteCnpj: string;
  @ApiProperty() @IsString() emitenteRazaoSocial: string;
  @ApiProperty() @IsString() destinatarioCpfCnpj: string;
  @ApiProperty() @IsString() destinatarioNome: string;
  @ApiProperty() @IsNumber() @Min(0) valorProdutos: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorFrete?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorSeguro?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorDesconto?: number;
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsString() modalidadeFrete?: string;
  @ApiProperty({ enum: ['CIF', 'FOB'] }) @IsOptional() @IsString() frete?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorICMS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorIPI?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorPIS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorCOFINS?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseCalculoICMS?: number;
  @ApiProperty({ type: [NfeItemDto] }) @ValidateNested({ each: true }) @Type(() => NfeItemDto) @IsArray() itens: NfeItemDto[];
}

export class CancelarNfeDto {
  @ApiProperty() @IsString() justificativa: string;
  @ApiPropertyOptional() @IsOptional() @IsString() numeroProtocolo?: string;
}

export class CartaCorrecaoDto {
  @ApiProperty() @IsString() nfeId: string;
  @ApiProperty() @IsString() correcao: string;
}

export class NfeFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emitente?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
