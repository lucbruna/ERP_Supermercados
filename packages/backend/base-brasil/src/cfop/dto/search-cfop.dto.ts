import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCfopDto {
  @ApiPropertyOptional({ enum: ['ENTRADA', 'SAIDA'], description: 'Filtrar por tipo de operação' })
  @IsOptional()
  @IsString()
  @IsEnum(['ENTRADA', 'SAIDA'])
  tipo?: string;
}
