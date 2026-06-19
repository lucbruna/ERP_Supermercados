import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum PricingStrategy {
  COST_PLUS = 'cost_plus',
  COMPETITIVE = 'competitive',
  DYNAMIC = 'dynamic',
  PROMOTIONAL = 'promotional',
  MARKDOWN = 'markdown',
}

export class PricingSuggestDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty({ enum: PricingStrategy }) @IsEnum(PricingStrategy) strategy: PricingStrategy;
  @ApiProperty() @IsNumber() @Min(0) costPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) marketPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) desiredMargin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) demandScore?: number;
}

export class OptimizeDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(0) costPrice: number;
  @ApiProperty() @IsNumber() @Min(0) currentPrice: number;
  @ApiProperty() @IsNumber() @Min(0) salesVolume: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) competitorPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) elasticity?: number;
}
