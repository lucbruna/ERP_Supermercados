import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNcmDto {
  @ApiPropertyOptional({ description: 'Busca por código ou descrição' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;
}
