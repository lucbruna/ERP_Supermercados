import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';

export class GerarPrevisaoDto {
  @ApiProperty() @IsString() produtoId: string;
  @ApiProperty() @IsDateString() data: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() fatores?: any[];
}

export class PrevisaoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() produtoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
}
