import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConsultaPrecoDto {
  @ApiProperty({ example: 'uuid-produto' })
  @IsString()
  produtoId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tabelaId?: string;
}
