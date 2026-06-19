import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FolhaStatus } from '@prisma/client';

export class CreateFolhaPagamentoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioBase: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  proventos?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  descontos?: any[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioBruto: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salarioLiquido: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  fgts: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inss: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  irrf: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional({ enum: FolhaStatus })
  @IsOptional()
  @IsEnum(FolhaStatus)
  status?: FolhaStatus;
}

export class UpdateFolhaPagamentoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioBase?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  proventos?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  descontos?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioBruto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salarioLiquido?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional({ enum: FolhaStatus })
  @IsOptional()
  @IsEnum(FolhaStatus)
  status?: FolhaStatus;
}

export class FolhaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcionarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ano?: number;

  @ApiPropertyOptional({ enum: FolhaStatus })
  @IsOptional()
  @IsEnum(FolhaStatus)
  status?: FolhaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CalcularFolhaDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  proventosAdicionais?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  descontosAdicionais?: any[];
}
