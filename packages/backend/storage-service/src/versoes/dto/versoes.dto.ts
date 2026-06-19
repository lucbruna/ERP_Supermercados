import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CriarVersaoDto {
  @ApiProperty({ description: 'ID do arquivo' })
  @IsString()
  arquivoId: string;

  @ApiProperty({ description: 'Nome original do arquivo' })
  @IsString()
  nomeOriginal: string;

  @ApiProperty({ description: 'Tamanho em bytes' })
  tamanhoBytes: number;

  @ApiProperty({ description: 'Hash SHA-256' })
  @IsString()
  hash: string;

  @ApiProperty({ description: 'Chave no provedor de storage' })
  @IsString()
  key: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  criadoPor?: string;
}
