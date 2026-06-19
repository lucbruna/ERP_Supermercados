import { IsString, IsNumber, IsOptional, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  total: number;
}

export class OrderNewDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  lojaId: string;

  @IsUUID()
  unidadeId: string;

  @IsString()
  pdvId: string;

  @IsString()
  @IsOptional()
  clienteId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total: number;

  @IsString()
  status: string;
}

export class OrderUpdatedDto {
  @IsUUID()
  orderId: string;

  @IsString()
  status: string;

  @IsOptional()
  data?: any;
}

export class PaymentCompletedDto {
  @IsUUID()
  orderId: string;

  @IsString()
  paymentMethod: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;
}

export class PdvStatusDto {
  @IsString()
  pdvId: string;

  @IsString()
  status: string;

  @IsOptional()
  metadata?: any;
}

export class TabOpenDto {
  @IsString()
  mesaId: string;

  @IsString()
  tabId: string;

  @IsNumber()
  total: number;
}
