import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, Min, IsEnum, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContratoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsUUID()
  tipoContratoId: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataExperienciaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataExperienciaFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataEfetivacao?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioBase: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  jornadaSemanal: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioEntrada?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioSaida?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  intervaloRefeicao?: string;

  @ApiProperty()
  @IsString()
  cargo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cbo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cnpjEmpregador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razaoSocialEmpregador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localTrabalho?: string;

  @ApiProperty({ enum: ['Integral', 'Parcial', 'Hibrido', 'HomeOffice'] })
  @IsString()
  tipoJornada: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorValeTransporte?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorValeRefeicao?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPlanoSaude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateContratoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataExperienciaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataExperienciaFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataEfetivacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioBase?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  jornadaSemanal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioEntrada?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioSaida?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  intervaloRefeicao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cbo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cnpjEmpregador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  razaoSocialEmpregador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localTrabalho?: string;

  @ApiPropertyOptional({ enum: ['Integral', 'Parcial', 'Hibrido', 'HomeOffice'] })
  @IsOptional()
  @IsString()
  tipoJornada?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorValeTransporte?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorValeRefeicao?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPlanoSaude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class ContratoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  funcionarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class AditarContratoDto {
  @ApiProperty()
  @IsDateString()
  data: string;

  @ApiProperty({ enum: ['Renovacao', 'Reajuste', 'Promocao', 'AlteracaoCargo', 'AlteracaoSalarial', 'AlteracaoJornada', 'Suspensao', 'Outros'] })
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valorAnterior?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valorNovo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFinal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentoPath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class RescindirContratoDto {
  @ApiProperty()
  @IsDateString()
  dataRescisao: string;

  @ApiProperty({ enum: ['SemJustaCausa', 'ComJustaCausa', 'PedidoDemissao', 'Acordo', 'TerminoContrato', 'Aposentadoria', 'Falecimento'] })
  @IsString()
  tipoRescisao: string;

  @ApiPropertyOptional({ enum: ['Trabalhado', 'Indenizado'] })
  @IsOptional()
  @IsString()
  avisoPrevio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataAvisoPrevio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataBaixaCTPS?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  saldoSalario?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  feriasVencidas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  feriasProporcionais?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  decimoTerceiro?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  avisoPrevioValor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  multaFGTS?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  indenizacao?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class DocumentoContratoDto {
  @ApiProperty({ enum: ['ContratoAssinado', 'Aditivo', 'Rescisao', 'ExameMedico', 'CTPS', 'Outros'] })
  @IsString()
  tipo: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caminhoArquivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}
