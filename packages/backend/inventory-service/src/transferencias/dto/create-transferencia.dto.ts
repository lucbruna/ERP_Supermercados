import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class TransferenciaItemDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  quantidade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeMedida?: string;
}

export class CreateTransferenciaDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsUUID()
  origemUnidadeId: string;

  @ApiProperty()
  @IsUUID()
  destinoUnidadeId: string;

  @ApiProperty()
  @IsUUID()
  responsavelOrigemId: string;

  @ApiProperty({ type: [TransferenciaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferenciaItemDto)
  itens: TransferenciaItemDto[];
}

export class TransferenciaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
