import { IsString, IsUUID, IsArray, IsNumber, IsOptional, Min, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusImpressao } from '@prisma/client';

export class CreateImpressaoDto {
  @ApiProperty()
  @IsUUID()
  etiquetaId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  produtoIds: string[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty()
  @IsUUID()
  usuarioId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class UpdateImpressaoStatusDto {
  @ApiProperty({ enum: StatusImpressao })
  @IsString()
  status: StatusImpressao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
