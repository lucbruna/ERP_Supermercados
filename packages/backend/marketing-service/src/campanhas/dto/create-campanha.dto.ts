import { IsString, IsEnum, IsArray, IsOptional, IsBoolean, IsDateString, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampanhaTipo } from '@prisma/client';

export class CreateCampanhaDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: CampanhaTipo })
  @IsEnum(CampanhaTipo)
  tipo: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmento?: string[];

  @ApiProperty()
  @IsString()
  mensagem: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  agendamento?: string;
}

export class UpdateCampanhaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ enum: CampanhaTipo })
  @IsOptional()
  @IsEnum(CampanhaTipo)
  tipo?: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  segmento?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mensagem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  agendamento?: string;
}

export class CampanhaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CampanhaTipo })
  @IsOptional()
  @IsEnum(CampanhaTipo)
  tipo?: CampanhaTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enviada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class EnviarCampanhaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  agendamento?: string;
}

export class CampanhaMetricasDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalEnviados: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalAbertos: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalCliques: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  conversao: number;
}
