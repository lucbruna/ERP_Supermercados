import { IsString, IsNumber, IsOptional, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNFeEntradaDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsNumber() numero: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() serie?: number;
  @ApiProperty() @IsString() chaveAcesso: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocolo?: string;
  @ApiProperty() @IsDateString() dataEmissao: string;
  @ApiProperty() @IsString() fornecedorCpfCnpj: string;
  @ApiProperty() @IsString() fornecedorNome: string;
  @ApiProperty() @IsString() cfopId: string;
  @ApiProperty() @IsNumber() @Min(0) valorNota: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() baseCalculo?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorIcms?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorIcmsSt?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorPis?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorCofins?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorIpi?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() xmlArquivo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pedidoCompraId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() itens?: any[];
}

export class NFeEntradaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chaveAcesso?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fornecedorNome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
