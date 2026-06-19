import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GerarSpedDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(12) mes: number;
  @ApiProperty() @IsNumber() @Min(2020) ano: number;
  @ApiPropertyOptional({ default: '018' }) @IsOptional() @IsString() versao?: string;
}

export class GerarSpedContabilDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(12) mes: number;
  @ApiProperty() @IsNumber() @Min(2020) ano: number;
  @ApiPropertyOptional({ default: '9' }) @IsOptional() @IsString() versao?: string;
}

export class SpedHistoricoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tipo?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @IsNumber() pagina?: number;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @IsNumber() limite?: number;
}
