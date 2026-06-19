import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsNumber, Min } from 'class-validator';

export enum ProcessamentoImagem {
  THUMBNAIL = 'thumbnail',
  MEDIUM = 'medium',
  LARGE = 'large',
  NONE = 'none',
}

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'Pasta destino' })
  @IsOptional()
  @IsString()
  pasta?: string;

  @ApiPropertyOptional({ description: 'Tags do arquivo' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'ID do usuário que criou' })
  @IsOptional()
  @IsString()
  criadoPor?: string;
}

export class UploadImageDto extends UploadFileDto {
  @ApiPropertyOptional({ enum: ProcessamentoImagem, default: ProcessamentoImagem.NONE })
  @IsOptional()
  @IsEnum(ProcessamentoImagem)
  processamento?: ProcessamentoImagem;
}

export class FileResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: any;
}

export class FilesResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: any[];
}
