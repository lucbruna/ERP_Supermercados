import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min } from 'class-validator';

export enum ForecastMethod {
  SMA = 'sma',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  LINEAR_REGRESSION = 'linear_regression',
  SEASONAL_DECOMPOSITION = 'seasonal_decomposition',
  AUTO = 'auto',
}

export class SalesForecastDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(1) periods: number;
  @ApiPropertyOptional({ enum: ForecastMethod })
  @IsOptional() @IsEnum(ForecastMethod) method?: ForecastMethod;
  @ApiPropertyOptional() @IsOptional() @IsArray() historicalSales?: number[];
}

export class InventoryForecastDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(0) currentStock: number;
  @ApiProperty() @IsNumber() @Min(0) leadTimeDays: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() safetyStock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() dailySales?: number;
}

export class DemandForecastDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(1) periods: number;
  @ApiPropertyOptional({ enum: ForecastMethod })
  @IsOptional() @IsEnum(ForecastMethod) method?: ForecastMethod;
  @ApiPropertyOptional() @IsOptional() @IsArray() historicalDemand?: number[];
}
