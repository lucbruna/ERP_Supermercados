import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AvaliacaoTipo, AvaliacaoStatus } from '@prisma/client';

export class CreateAvaliacaoDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsUUID()
  avaliadorId: string;

  @ApiProperty({ enum: AvaliacaoTipo })
  @IsEnum(AvaliacaoTipo)
  tipo: AvaliacaoTipo;

  @ApiProperty()
  @IsString()
  periodoAvaliacao: string;

  @ApiProperty()
  @IsString()
  competencia: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nota?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class UpdateAvaliacaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  nota?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ enum: AvaliacaoStatus })
  @IsOptional()
  @IsEnum(AvaliacaoStatus)
  status?: AvaliacaoStatus;
}

export class AvaliacaoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  funcionarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  avaliadorId?: string;

  @ApiPropertyOptional({ enum: AvaliacaoStatus })
  @IsOptional()
  @IsEnum(AvaliacaoStatus)
  status?: AvaliacaoStatus;

  @ApiPropertyOptional({ enum: AvaliacaoTipo })
  @IsOptional()
  @IsEnum(AvaliacaoTipo)
  tipo?: AvaliacaoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ResponderAvaliacaoDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  nota: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
