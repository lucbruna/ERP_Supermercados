import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SegmentoCliente } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchClienteDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ enum: SegmentoCliente })
  @IsOptional()
  @IsEnum(SegmentoCliente)
  segmento?: SegmentoCliente;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ default: 'asc' })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc';
}
