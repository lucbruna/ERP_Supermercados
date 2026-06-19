import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SelecionarVencedorDto {
  @ApiProperty() @IsString() @IsNotEmpty() fornecedorId: string;
  @ApiProperty() @IsString() @IsNotEmpty() aprovadoPor: string;
}
