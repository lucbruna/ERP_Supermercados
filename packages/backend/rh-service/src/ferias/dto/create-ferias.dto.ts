import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeriasStatus } from '@prisma/client';

export class CreateFeriasDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty()
  @IsDateString()
  dataFim: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  dias: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  abonoPecuniario?: boolean;

  @ApiPropertyOptional({ enum: FeriasStatus })
  @IsOptional()
  @IsEnum(FeriasStatus)
  status?: FeriasStatus;
}

export class UpdateFeriasDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  dias?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  abonoPecuniario?: boolean;

  @ApiPropertyOptional({ enum: FeriasStatus })
  @IsOptional()
  @IsEnum(FeriasStatus)
  status?: FeriasStatus;
}

export class FeriasQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcionarioId?: string;

  @ApiPropertyOptional({ enum: FeriasStatus })
  @IsOptional()
  @IsEnum(FeriasStatus)
  status?: FeriasStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
