import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoConsentimento {
  MARKETING = 'MARKETING',
  TERCEIROS = 'TERCEIROS',
  ANALISE = 'ANALISE',
  PROCESAMENTO = 'PROCESAMENTO',
}

export enum TipoSolicitacao {
  ACESSO = 'ACESSO',
  RETIFICACAO = 'RETIFICACAO',
  ANONIMIZACAO = 'ANONIMIZACAO',
  BLOQUEIO = 'BLOQUEIO',
  ELIMINACAO = 'ELIMINACAO',
  PORTABILIDADE = 'PORTABILIDADE',
}

export enum StatusSolicitacao {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  NEGADA = 'NEGADA',
}

export enum TipoDadoPessoal {
  CPF = 'CPF',
  RG = 'RG',
  DATA_NASCIMENTO = 'DATA_NASCIMENTO',
  ENDERECO = 'ENDERECO',
  TELEFONE = 'TELEFONE',
  EMAIL = 'EMAIL',
  BIOMETRIA = 'BIOMETRIA',
  SALARIO = 'SALARIO',
  DADOS_BANCARIOS = 'DADOS_BANCARIOS',
}

export class ConsentimentoDto {
  @ApiProperty({ enum: TipoConsentimento })
  @IsEnum(TipoConsentimento)
  tipo: TipoConsentimento;

  @ApiProperty()
  @IsBoolean()
  concedido: boolean;
}

export class CriarSolicitacaoDto {
  @ApiProperty()
  @IsString()
  usuarioId: string;

  @ApiProperty({ enum: TipoSolicitacao })
  @IsEnum(TipoSolicitacao)
  tipo: TipoSolicitacao;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dadosRelacionados?: string;
}

export class ProcessarSolicitacaoDto {
  @ApiProperty({ enum: StatusSolicitacao })
  @IsEnum(StatusSolicitacao)
  status: StatusSolicitacao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resposta?: string;
}

export class RegistrarDadosPessoaisDto {
  @ApiProperty()
  @IsString()
  usuarioId: string;

  @ApiProperty({ enum: TipoDadoPessoal })
  @IsEnum(TipoDadoPessoal)
  tipo: TipoDadoPessoal;

  @ApiProperty()
  @IsString()
  valor: string;

  @ApiProperty()
  @IsString()
  finalidade: string;

  @ApiProperty()
  @IsString()
  origem: string;
}

export class CriarPoliticaDto {
  @ApiProperty()
  @IsString()
  versao: string;

  @ApiProperty()
  @IsString()
  texto: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dataPublicacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dataInicioVigencia?: string;
}

export class AceitarPoliticaDto {
  @ApiProperty()
  @IsString()
  usuarioId: string;

  @ApiProperty()
  @IsString()
  ip: string;
}

export class ListarSolicitacoesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiPropertyOptional({ enum: TipoSolicitacao })
  @IsOptional()
  @IsEnum(TipoSolicitacao)
  tipo?: TipoSolicitacao;

  @ApiPropertyOptional({ enum: StatusSolicitacao })
  @IsOptional()
  @IsEnum(StatusSolicitacao)
  status?: StatusSolicitacao;
}
