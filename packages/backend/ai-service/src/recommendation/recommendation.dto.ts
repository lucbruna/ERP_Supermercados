import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export enum RecommendationStrategy {
  CROSS_SELL = 'cross_sell',
  UP_SELL = 'up_sell',
  REPLENISHMENT = 'replenishment',
  SEASONAL = 'seasonal',
  PERSONA_BASED = 'persona_based',
}

export class ProductRecommendationDto {
  @ApiProperty() @IsString() productId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class CrossSellDto {
  @ApiProperty() @IsString() productId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) limit?: number;
}

export class CustomerRecommendationDto {
  @ApiProperty() @IsString() customerId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) limit?: number;
  @ApiPropertyOptional({ enum: RecommendationStrategy })
  @IsOptional() @IsEnum(RecommendationStrategy) strategy?: RecommendationStrategy;
}
