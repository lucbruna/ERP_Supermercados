import { IsString, IsInt, IsOptional, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditarPontosDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  pontos: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendaId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  descricao: string;
}
