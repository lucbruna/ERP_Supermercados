import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AprovarPedidoDto {
  @ApiProperty() @IsString() @IsNotEmpty() usuarioId: string;
  @ApiProperty() @IsString() @IsNotEmpty() nivel: string;
}
