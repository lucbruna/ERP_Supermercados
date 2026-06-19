import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class AnalisarComportamentoDto {
  @ApiProperty() @IsString() clienteId: string;
  @ApiProperty() @IsString() periodo: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() metricas?: any[];
}

export class ComportamentoQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() clienteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() periodo?: string;
}
