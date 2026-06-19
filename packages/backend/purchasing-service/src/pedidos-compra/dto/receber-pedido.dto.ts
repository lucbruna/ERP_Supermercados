import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsArray, IsOptional } from 'class-validator';

export class ReceberPedidoDto {
  @ApiProperty() @IsDateString() dataEntregaReal: string;
  @ApiProperty({ type: [Object] }) @IsArray() @IsNotEmpty() itensRecebidos: any[];
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}
