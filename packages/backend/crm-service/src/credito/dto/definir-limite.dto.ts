import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DefinirLimiteDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  limite: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class PagarCreditoDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;
}
