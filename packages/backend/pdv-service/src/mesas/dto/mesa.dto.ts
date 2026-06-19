import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMesaDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() unidadeId: string;
  @ApiProperty() @IsNumber() numero: number;
  @ApiPropertyOptional({ default: 4 }) @IsOptional() @IsNumber() @Min(1) capacidade?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() localizacao?: string;
}

export class UpdateMesaDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) capacidade?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() localizacao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

export class AbrirMesaDto {
  @ApiProperty() @IsString() vendaId: string;
}

export class MesaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unidadeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}
