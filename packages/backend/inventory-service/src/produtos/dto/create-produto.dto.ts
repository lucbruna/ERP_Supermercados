import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnidadeMedida } from '@prisma/client';

export class CreateProdutoDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsUUID()
  unidadeId: string;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @IsString()
  codigoBarras: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoBarrasSecundario?: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricaoReduzida?: string;

  @ApiProperty()
  @IsString()
  marca: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricante?: string;

  @ApiProperty({ enum: UnidadeMedida })
  @IsEnum(UnidadeMedida)
  unidadeMedida: UnidadeMedida;

  @ApiProperty()
  @IsString()
  ncm: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cest?: string;

  @ApiProperty()
  @IsString()
  cfop: string;

  @ApiProperty()
  @IsNumber()
  origem: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precoCusto: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precoVenda: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoPromocional?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  lucroPercentual: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  estoqueMinimo: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  estoqueMaximo: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueAtual?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueReservado?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fracionado?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  pesavel?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  validadeDias?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  loteControlado?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;

  @ApiProperty()
  @IsUUID()
  categoriaId: string;
}

export class UpdateProdutoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoBarrasSecundario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricaoReduzida?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricante?: string;

  @ApiPropertyOptional({ enum: UnidadeMedida })
  @IsOptional()
  @IsEnum(UnidadeMedida)
  unidadeMedida?: UnidadeMedida;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ncm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cest?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cfop?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  origem?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoCusto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoVenda?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoPromocional?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  lucroPercentual?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueMinimo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueMaximo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fracionado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pesavel?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  validadeDias?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  loteControlado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoriaId?: string;
}

export class ProdutoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  estoqueBaixo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
