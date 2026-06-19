import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateExpedicaoDto {
  @ApiProperty() @IsString() separacaoId: string;
  @ApiProperty() @IsString() roteirizacaoId: string;
  @ApiProperty() @IsInt() volumes: number;
  @ApiProperty() @IsNumber() pesoTotal: number;
  @ApiProperty() @IsString() conferenteId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}

export class UpdateExpedicaoDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() volumes?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pesoTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() conferenteId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observacao?: string;
}
