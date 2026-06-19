import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class KpiUpdateDto {
  @IsString()
  metric: string;

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  previousValue?: number;

  @IsNumber()
  @IsOptional()
  percentageChange?: number;

  @IsString()
  @IsOptional()
  period?: string;

  @IsOptional()
  metadata?: any;
}

export class MetricNewDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsString()
  category: string;

  @IsOptional()
  metadata?: any;
}

export class AlertTriggeredDto {
  @IsUUID()
  id: string;

  @IsString()
  type: string;

  @IsString()
  severity: 'low' | 'medium' | 'high' | 'critical';

  @IsString()
  message: string;

  @IsOptional()
  data?: any;
}
