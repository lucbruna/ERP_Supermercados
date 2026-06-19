import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsarCupomDto {
  @ApiProperty()
  @IsString()
  cupomId: string;

  @ApiProperty()
  @IsString()
  clienteId: string;

  @ApiProperty()
  @IsString()
  vendaId: string;
}
