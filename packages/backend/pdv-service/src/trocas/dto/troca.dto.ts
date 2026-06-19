import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDate,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TrocaTipo {
  DINHEIRO = 'DINHEIRO',
  TROCA_DIRETA = 'TROCA_DIRETA',
}

export enum TrocaStatus {
  PENDENTE = 'PENDENTE',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

export class ItemTrocaDto {
  @ApiProperty({ example: 'uuid-produto' })
  @IsString()
  produtoId: string;

  @ApiProperty({ example: 'Produto' })
  @IsString()
  descricao: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @ApiProperty({ example: 25.90 })
  @IsNumber()
  @Min(0)
  precoUnitario: number;

  @ApiProperty({ example: 25.90 })
  @IsNumber()
  @Min(0)
  precoTotal: number;
}

export class CreateTrocaDto {
  @ApiProperty({ example: 'uuid-venda' })
  @IsString()
  vendaId: string;

  @ApiProperty({ type: [ItemTrocaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemTrocaDto)
  itensTrocados: ItemTrocaDto[];

  @ApiProperty({ type: [ItemTrocaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemTrocaDto)
  itensNovos: ItemTrocaDto[];

  @ApiProperty({ example: 0.00 })
  @IsNumber()
  diferenca: number;

  @ApiProperty({ enum: TrocaTipo, default: TrocaTipo.TROCA_DIRETA })
  @IsEnum(TrocaTipo)
  @IsOptional()
  tipo?: TrocaTipo;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class UpdateTrocaStatusDto {
  @ApiProperty({ enum: TrocaStatus })
  @IsEnum(TrocaStatus)
  status: TrocaStatus;
}

export class TrocaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiPropertyOptional({ enum: TrocaStatus })
  @IsOptional()
  @IsEnum(TrocaStatus)
  status?: TrocaStatus;
}
