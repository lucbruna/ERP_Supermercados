import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CriarPastaDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caminho?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paiId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  criadoPor?: string;
}

export class AtualizarPastaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;
}
