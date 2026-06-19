import { IsString, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DebitarCashbackDto {
  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsNumber()
  valor: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  descricao: string;
}
