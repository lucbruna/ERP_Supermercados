import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class SentimentDto {
  @ApiProperty() @IsString() text: string;
}

export class ClassifyDto {
  @ApiProperty() @IsString() text: string;
}

export class KeywordsDto {
  @ApiProperty() @IsString() text: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() stopWords?: string[];
}

export class CategorizeProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export enum IntentType {
  COMPLAINT = 'complaint',
  QUESTION = 'question',
  ORDER = 'order',
  FEEDBACK = 'feedback',
  OTHER = 'other',
}
