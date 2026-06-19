import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditarCashbackDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsNumber()
  valor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  descricao: string;
}
