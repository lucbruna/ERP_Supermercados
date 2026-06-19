import { IsString, IsInt, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DebitarPontosDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  pontos: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  descricao: string;
}
