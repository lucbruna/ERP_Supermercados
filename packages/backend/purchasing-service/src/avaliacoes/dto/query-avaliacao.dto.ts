import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryAvaliacaoDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fornecedorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() avaliadorId?: string;
}
