import { IsString, IsOptional, IsEnum, IsNumber, IsIP, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PdvTipo {
  FIXO = 'FIXO',
  MOVEL = 'MOVEL',
  AUTOATENDIMENTO = 'AUTOATENDIMENTO',
}

export enum PdvStatus {
  LIVRE = 'LIVRE',
  OCUPADO = 'OCUPADO',
  FECHADO = 'FECHADO',
  MANUTENCAO = 'MANUTENCAO',
}

export class CreatePdvDto {
  @ApiProperty({ example: 'uuid-company' })
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'uuid-unidade' })
  @IsString()
  unidadeId: string;

  @ApiProperty({ example: 'PDV-001' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'Caixa 01' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: PdvTipo, default: PdvTipo.FIXO })
  @IsEnum(PdvTipo)
  @IsOptional()
  tipo?: PdvTipo;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional({ example: '00:1A:2B:3C:4D:5E' })
  @IsOptional()
  @IsString()
  mac?: string;
}

export class UpdatePdvDto {
  @ApiPropertyOptional({ example: 'Caixa 01 (Atualizado)' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: PdvTipo })
  @IsOptional()
  @IsEnum(PdvTipo)
  tipo?: PdvTipo;

  @ApiPropertyOptional({ example: '192.168.1.101' })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional({ example: '00:1A:2B:3C:4D:5F' })
  @IsOptional()
  @IsString()
  mac?: string;

  @ApiPropertyOptional({ enum: PdvStatus })
  @IsOptional()
  @IsEnum(PdvStatus)
  status?: PdvStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operadorId?: string;
}

export class AberturaPdvDto {
  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  saldoAbertura: number;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class FechamentoPdvDto {
  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  saldoFechamento: number;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class PdvQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidadeId?: string;

  @ApiPropertyOptional({ enum: PdvStatus })
  @IsOptional()
  @IsEnum(PdvStatus)
  status?: PdvStatus;
}
