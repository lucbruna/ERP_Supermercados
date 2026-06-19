import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBancoHorasDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiProperty()
  @IsNumber()
  saldoAnterior: number;

  @ApiProperty()
  @IsNumber()
  horasCreditadas: number;

  @ApiProperty()
  @IsNumber()
  horasDebitadas: number;

  @ApiProperty()
  @IsNumber()
  saldoAtual: number;
}

export class UpdateBancoHorasDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoAnterior?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  horasCreditadas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  horasDebitadas?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saldoAtual?: number;
}

export class BancoHorasQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  funcionarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  mes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  ano?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreditarHorasDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiProperty()
  @IsNumber()
  horas: number;
}

export class DebitarHorasDto {
  @ApiProperty()
  @IsUUID()
  funcionarioId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  mes: number;

  @ApiProperty()
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiProperty()
  @IsNumber()
  horas: number;
}
