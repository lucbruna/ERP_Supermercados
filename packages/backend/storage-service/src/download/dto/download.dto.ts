import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DownloadQueryDto {
  @ApiPropertyOptional({ description: 'Forçar tipo de download (attachment)' })
  @IsOptional()
  @IsString()
  disposition?: string;
}
