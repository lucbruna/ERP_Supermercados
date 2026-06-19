import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateTabelaPrecoDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyId: string;
  @ApiProperty() @IsString() @IsNotEmpty() fornecedorId: string;
  @ApiProperty() @IsString() @IsNotEmpty() nome: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dataFim?: string;
  @ApiProperty({ type: [Object] }) @IsArray() @IsNotEmpty() itens: any[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
