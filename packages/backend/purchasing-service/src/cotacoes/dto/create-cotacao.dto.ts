import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateCotacaoDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyId: string;
  @ApiProperty() @IsString() @IsNotEmpty() unidadeId: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsNotEmpty()
  itens: any[];

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsNotEmpty()
  fornecedores: any[];

  @ApiProperty() @IsDateString() dataAbertura: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFechamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
