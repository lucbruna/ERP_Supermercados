import { IsString, IsNumber, IsOptional, IsDateString, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncCompraDto {
  @ApiProperty()
  @IsString()
  vendaId: string;

  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsNumber()
  numero: number;

  @ApiProperty()
  @IsDateString()
  dataHora: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  desconto?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  acrescimo?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ default: 'PDV' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ default: 'FINALIZADA' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  itens?: any[];

  @ApiPropertyOptional({ default: [] })
  @IsOptional()
  @IsArray()
  pagamentos?: any[];
}
