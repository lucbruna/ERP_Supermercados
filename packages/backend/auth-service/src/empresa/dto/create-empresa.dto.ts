import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  cnpj: string;

  @IsString()
  razaoSocial: string;

  @IsString()
  nomeFantasia: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsOptional()
  @IsIn(['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI'])
  regimeTributario?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsOptional()
  @IsIn(['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI'])
  regimeTributario?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
