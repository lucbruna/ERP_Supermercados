import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejeitarPedidoDto {
  @ApiProperty() @IsString() @IsNotEmpty() usuarioId: string;
  @ApiProperty() @IsString() @IsNotEmpty() motivo: string;
}
