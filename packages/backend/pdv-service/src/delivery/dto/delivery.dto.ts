import { IsString, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsString() vendaId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clienteId?: string;
  @ApiProperty() @IsString() clienteNome: string;
  @ApiProperty() @IsString() clienteTelefone: string;
  @ApiProperty() @IsObject() endereco: any;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsNumber() @Min(0) taxaEntrega?: number;
}

export class UpdateDeliveryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entregadorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class DeliveryQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
