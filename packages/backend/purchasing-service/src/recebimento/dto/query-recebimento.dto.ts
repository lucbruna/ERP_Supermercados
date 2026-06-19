import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryRecebimentoDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() pedidoCompraId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conferenteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
}
