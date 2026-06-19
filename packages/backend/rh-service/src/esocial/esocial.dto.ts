import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min, IsArray, ValidateNested, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TpInsc {
  CNPJ = '1',
  CPF = '2',
}

export enum TpAmb {
  PRODUCAO = '1',
  HOMOLOGACAO = '2',
}

export enum ProcEmi {
  EMPREGADOR = '1',
  CONTABILIDADE = '2',
  TERCEIRO = '3',
}

export enum Sexo {
  MASCULINO = 'M',
  FEMININO = 'F',
}

export enum RacaCor {
  NAO_INFORMADA = '1',
  BRANCA = '2',
  PRETA = '3',
  PARDA = '4',
  AMARELA = '5',
  INDIGENA = '6',
}

export enum RegTrab {
  CLT = '1',
  ESTATUTARIO = '2',
  AVULSO = '3',
}

export enum CategoriaTrab {
  EMPREGADO = '001',
  AVULSO = '002',
  DIRIGENTE = '003',
  ESTAGIARIO = '004',
  DOMESTICO = '005',
  TSV = '006',
}

export class EnderecoDto {
  @ApiProperty() @IsString() cep: string;
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complemento?: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty({ maxLength: 2 }) @IsString() uf: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pais?: string;
}

export class CtpsDto {
  @ApiProperty() @IsString() numero: string;
  @ApiProperty() @IsNumber() serio: number;
  @ApiProperty({ maxLength: 2 }) @IsString() uf: string;
}

export class AdmissaoData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty({ enum: Sexo }) @IsEnum(Sexo) sexo: Sexo;
  @ApiProperty({ enum: RacaCor }) @IsEnum(RacaCor) racaCor: RacaCor;
  @ApiProperty() @IsDateString() dataNascimento: string;
  @ApiProperty() @ValidateNested() @Type(() => EnderecoDto) endereco: EnderecoDto;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => CtpsDto) ctps?: CtpsDto;
  @ApiProperty() @IsDateString() dataAdmissao: string;
  @ApiProperty({ enum: RegTrab }) @IsEnum(RegTrab) regTrab: RegTrab;
  @ApiProperty({ enum: CategoriaTrab }) @IsEnum(CategoriaTrab) categoriaTrab: CategoriaTrab;
  @ApiProperty() @IsString() cargo: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsNumber() @Min(0) salario: number;
  @ApiProperty() @IsString() jornada: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() celular?: string;
}

export class AlteracaoData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiPropertyOptional() @IsOptional() @IsString() novoCargo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) novoSalario?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() novaJornada?: string;
  @ApiPropertyOptional() @IsOptional() @ValidateNested() @Type(() => EnderecoDto) endereco?: EnderecoDto;
  @ApiProperty() @IsDateString() dataAlteracao: string;
  @ApiPropertyOptional() @IsOptional() @IsString() motivo?: string;
}

export class FeriasData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiProperty() @IsDateString() dataFim: string;
  @ApiProperty() @IsNumber() @Min(1) dias: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) diasAbono?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() antecipaParcela?: boolean;
}

export class CondicaoAmbienteData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiProperty() @IsString() localTrabalho: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() insalubre?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() periculoso?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() descricaoAmbiente?: string;
}

export class AposentadoriaData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) fatorRisco?: number;
  @ApiProperty() @IsString() codigoAposentadoria: string;
  @ApiProperty() @IsString() descricaoAtividade: string;
}

export class AfastamentoData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataPrevistaRetorno?: string;
  @ApiProperty() @IsString() codigoAfastamento: string;
  @ApiProperty() @IsString() motivo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class ReintegracaoData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataReintegracao: string;
  @ApiProperty() @IsString() motivo: string;
  @ApiProperty() @IsString() cargo: string;
  @ApiProperty() @IsNumber() @Min(0) salario: number;
}

export class RescisaoData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataDesligamento: string;
  @ApiProperty() @IsString() codigoMotivo: string;
  @ApiProperty() @IsString() motivo: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() avisoPrevio?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) diasAvisoPrevio?: number;
}

export class DesligamentoTSVData {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() cnpj: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsString() matricula: string;
  @ApiProperty() @IsDateString() dataDesligamento: string;
  @ApiProperty() @IsString() codigoMotivo: string;
}

export class EventoDto {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() tipo: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsString() xml: string;
  @ApiProperty() @IsString() hash: string;
  @ApiProperty() @IsString() status: string;
  @ApiPropertyOptional() @IsOptional() @IsString() protocolo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recibo?: string;
  @ApiProperty() dataCriacao: Date;
}

export class LoteEventosDto {
  @ApiProperty({ description: 'Group of events to send (max 50)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventoDto)
  eventos: EventoDto[];
}

export class ConsultaEventosDto {
  @ApiPropertyOptional() @IsOptional() @IsString() funcionarioId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
}

export class EsocialResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() tipo: string;
  @ApiProperty() xml: string;
  @ApiProperty() hash: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() protocolo?: string;
  @ApiPropertyOptional() recibo?: string;
}
