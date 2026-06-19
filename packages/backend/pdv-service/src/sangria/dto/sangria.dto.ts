import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSangriaDto {
  @ApiProperty({ example: 'uuid-pdv' })
  @IsString()
  pdvId: string;

  @ApiProperty({ example: 200.00 })
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'Retirada para pagamento de fornecedor' })
  @IsString()
  motivo: string;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class CreateSuprimentoDto {
  @ApiProperty({ example: 'uuid-pdv' })
  @IsString()
  pdvId: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: 'Depósito inicial' })
  @IsString()
  origem: string;

  @ApiProperty()
  @IsString()
  operadorId: string;
}

export class SangriaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdvId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dataInicio?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  dataFim?: Date;
}

export class SuprimentoQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdvId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dataInicio?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  dataFim?: Date;
}
