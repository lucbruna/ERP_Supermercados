import { IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MetricQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SystemMetricDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cpu?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  memory?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  disk?: number;
}
