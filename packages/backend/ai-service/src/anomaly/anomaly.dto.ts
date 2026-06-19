import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, Min } from 'class-validator';

export class DetectDto {
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsArray() @IsNumber({}, { each: true }) values: number[];
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() threshold?: number;
}

export class PricingAnomalyDto {
  @ApiProperty() @IsString() productId: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiProperty() @IsString() category: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() categoryAveragePrice?: number;
}
