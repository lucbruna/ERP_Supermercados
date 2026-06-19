import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnidadeDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsString()
  cnpj: string;

  @IsString()
  nome: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateUnidadeDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
