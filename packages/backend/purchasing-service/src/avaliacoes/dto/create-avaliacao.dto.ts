import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvaliacaoDto {
  @ApiProperty() @IsString() @IsNotEmpty() fornecedorId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() pedidoCompraId?: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  @IsNotEmpty()
  criterios: any[];

  @ApiProperty() @IsNumber() @Min(0) @Max(10) @Type(() => Number) notaGlobal: number;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
  @ApiProperty() @IsString() @IsNotEmpty() avaliadorId: string;
  @ApiProperty() @IsDateString() data: string;
}
