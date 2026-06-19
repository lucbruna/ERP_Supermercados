import { IsString, IsNumber, IsOptional, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NfceItemDto {
  @ApiProperty() @IsString() codigoProduto: string;
  @ApiProperty() @IsString() descricao: string;
  @ApiProperty() @IsString() ncm: string;
  @ApiProperty() @IsString() cfop: string;
  @ApiProperty() @IsString() unidade: string;
  @ApiProperty() @IsNumber() @Min(0) quantidade: number;
  @ApiProperty() @IsNumber() @Min(0) valorUnitario: number;
  @ApiProperty() @IsNumber() @Min(0) valorTotal: number;
}

export class EmitirNfceDto {
  @ApiProperty() @IsString() empresaFiscalId: string;
  @ApiProperty() @IsString() vendaId: string;
  @ApiProperty() @IsNumber() numero: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() serie?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() destinatarioCpfCnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinatarioNome?: string;
  @ApiProperty() @IsNumber() @Min(0) valorNota: number;
  @ApiPropertyOptional() @IsOptional() @IsString() finalidade?: string;
  @ApiProperty({ type: [NfceItemDto] }) @ValidateNested({ each: true }) @Type(() => NfceItemDto) @IsArray() itens: NfceItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() pagamentos?: any[];
}

export class NfceFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vendaId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
