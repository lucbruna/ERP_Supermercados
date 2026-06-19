import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class NotaFiscalDto {
  @ApiProperty() @IsString() @IsNotEmpty() numero: string;
  @ApiProperty() @IsString() @IsNotEmpty() serie: string;
  @ApiProperty() @IsDateString() dataEmissao: string;
  @ApiProperty() @IsString() @IsNotEmpty() chaveAcesso: string;
  @ApiPropertyOptional() @IsOptional() @IsString() url?: string;
}

export class CreateRecebimentoDto {
  @ApiProperty() @IsString() @IsNotEmpty() pedidoCompraId: string;

  @ApiProperty() @ValidateNested() @Type(() => NotaFiscalDto) notaFiscal: NotaFiscalDto;

  @ApiProperty() @IsDateString() dataRecebimento: string;
  @ApiProperty() @IsString() @IsNotEmpty() conferenteId: string;

  @ApiProperty({ type: [Object] }) @IsArray() @IsNotEmpty() itens: any[];

  @ApiPropertyOptional() @IsOptional() @IsString() avarias?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() divergencias?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}
