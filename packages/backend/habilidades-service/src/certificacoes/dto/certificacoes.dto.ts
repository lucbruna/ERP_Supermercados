import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificacaoStatus } from '@prisma/client';

export class CreateCertificacaoDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  orgaoEmissor: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  validadeMeses: number;
}

export class UpdateCertificacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgaoEmissor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  validadeMeses?: number;
}

export class CertificacaoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  funcionarioId?: string;

  @ApiPropertyOptional({ enum: CertificacaoStatus })
  @IsOptional()
  @IsEnum(CertificacaoStatus)
  status?: CertificacaoStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ConcederCertificacaoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsDateString()
  dataObtencao: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentoPath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class RenovarCertificacaoDto {
  @ApiProperty()
  @IsDateString()
  novaDataValidade: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
