import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryFornecedorDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cnpj?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
