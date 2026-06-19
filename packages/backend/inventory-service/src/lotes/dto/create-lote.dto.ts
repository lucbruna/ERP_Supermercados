import { IsString, IsNumber, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoteDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsString()
  codigoLote: string;

  @ApiProperty()
  @IsDateString()
  dataFabricacao: string;

  @ApiProperty()
  @IsDateString()
  dataValidade: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantidadeInicial: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantidadeAtual: number;

  @ApiPropertyOptional()
  @IsDateString()
  recebidoEm?: string;
}

export class LoteQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  produtoId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsNumber()
  limit?: number;
}

export class BaixaLoteDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.001)
  quantidade: number;
}
