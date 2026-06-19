import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsObject,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContratoDto {
  @ApiProperty() @IsString() @IsNotEmpty() companyId: string;
  @ApiProperty() @IsString() @IsNotEmpty() fornecedorId: string;
  @ApiProperty() @IsString() @IsNotEmpty() numero: string;
  @ApiProperty() @IsDateString() dataInicio: string;
  @ApiProperty() @IsDateString() dataFim: string;
  @ApiProperty() @IsObject() condicoes: any;
  @ApiProperty() @IsNumber() @Min(0) @Type(() => Number) valorEstimado: number;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}
