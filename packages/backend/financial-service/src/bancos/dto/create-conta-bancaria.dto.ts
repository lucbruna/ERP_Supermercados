import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoContaBancaria } from '@prisma/client';

export class CreateContaBancariaDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'Banco do Brasil' })
  @IsString()
  banco: string;

  @ApiProperty({ example: '001' })
  @IsString()
  codigoBanco: string;

  @ApiProperty({ example: '1234-5' })
  @IsString()
  agencia: string;

  @ApiProperty({ example: '56789-0' })
  @IsString()
  conta: string;

  @ApiProperty({ example: '1' })
  @IsString()
  digito: string;

  @ApiPropertyOptional({ enum: TipoContaBancaria, default: 'CORRENTE' })
  @IsOptional()
  @IsEnum(TipoContaBancaria)
  tipo?: TipoContaBancaria;

  @ApiPropertyOptional({ example: ['tomga@email.com', '11999999999'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pix?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  saldoAtual?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  saldoDisponivel?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  limiteChequeEspecial?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateContaBancariaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigoBanco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  digito?: string;

  @ApiPropertyOptional({ enum: TipoContaBancaria })
  @IsOptional()
  @IsEnum(TipoContaBancaria)
  tipo?: TipoContaBancaria;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pix?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoAtual?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoDisponivel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limiteChequeEspecial?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class MovimentacaoBancariaDto {
  @ApiProperty()
  @IsString()
  tipo: 'ENTRADA' | 'SAIDA';

  @ApiProperty()
  @IsNumber()
  valor: number;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty({ example: 'TRANSFERENCIA' })
  @IsString()
  formaPagamento: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;
}
