import { ApiProperty, ApiPropertyOptional, ApiBody } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';

export enum FormatoCompressao {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
}

export class ProcessarImagemDto {
  @ApiProperty({ description: 'ID do arquivo de imagem' })
  @IsString()
  arquivoId: string;

  @ApiPropertyOptional({ description: 'Largura desejada' })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional({ description: 'Altura desejada' })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'Ângulo de rotação (0, 90, 180, 270)' })
  @IsOptional()
  @IsInt()
  rotate?: number;

  @ApiPropertyOptional({ description: 'Crop: left' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cropLeft?: number;

  @ApiPropertyOptional({ description: 'Crop: top' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cropTop?: number;

  @ApiPropertyOptional({ description: 'Crop: width' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cropWidth?: number;

  @ApiPropertyOptional({ description: 'Crop: height' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cropHeight?: number;
}

export class ComprimirImagemDto {
  @ApiProperty({ description: 'ID do arquivo de imagem' })
  @IsString()
  arquivoId: string;

  @ApiPropertyOptional({ enum: FormatoCompressao, default: FormatoCompressao.JPEG })
  @IsOptional()
  @IsEnum(FormatoCompressao)
  formato?: FormatoCompressao;

  @ApiPropertyOptional({ description: 'Qualidade (1-100)', default: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  qualidade?: number;
}

export class OcrRequestDto {
  @ApiProperty({ description: 'ID do arquivo de imagem ou PDF' })
  @IsString()
  arquivoId: string;
}

export class PdfPreviewDto {
  @ApiProperty({ description: 'ID do arquivo PDF' })
  @IsString()
  arquivoId: string;
}
