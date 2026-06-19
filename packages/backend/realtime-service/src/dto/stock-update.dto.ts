import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class StockLowDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsUUID()
  departamentoId: string;

  @IsNumber()
  currentStock: number;

  @IsNumber()
  minimumStock: number;

  @IsString()
  @IsOptional()
  unidadeId?: string;
}

export class StockOutDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsUUID()
  departamentoId: string;

  @IsString()
  @IsOptional()
  unidadeId?: string;
}

export class TransferIncomingDto {
  @IsUUID()
  transferId: string;

  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsUUID()
  fromUnidadeId: string;

  @IsUUID()
  toUnidadeId: string;

  @IsString()
  status: string;
}

export class PriceChangedDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  sku: string;

  @IsNumber()
  oldPrice: number;

  @IsNumber()
  newPrice: number;

  @IsUUID()
  @IsOptional()
  departamentoId?: string;
}
