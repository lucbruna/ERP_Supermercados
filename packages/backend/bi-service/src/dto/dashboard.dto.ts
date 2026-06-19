import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateDashboardDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty() @IsArray() layout: any[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class UpdateDashboardDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() layout?: any[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}
