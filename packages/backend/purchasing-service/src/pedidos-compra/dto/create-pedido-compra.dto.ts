import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedidoCompraDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyId: string;
  @ApiProperty() @IsString() @IsNotEmpty() unidadeId: string;
  @ApiProperty() @IsString() @IsNotEmpty() fornecedorId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cotacaoId?: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsNotEmpty()
  itens: any[];

  @ApiProperty() @IsDateString() dataPedido: string;
  @ApiProperty() @IsDateString() dataEntregaPrevista: string;

  @ApiProperty() @IsNumber() @Min(0) @Type(() => Number) valorTotal: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) frete?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) desconto?: number;

  @ApiProperty() @IsString() @IsNotEmpty() condicaoPagamento: string;
}
