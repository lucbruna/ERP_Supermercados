import { IsString, IsOptional, IsUUID, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDestinatarioDto {
  @ApiProperty()
  @IsUUID()
  campanhaId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateDestinatariosBatchDto {
  @ApiProperty()
  @IsUUID()
  campanhaId: string;

  @ApiProperty({ type: [CreateDestinatarioDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDestinatarioDto)
  destinatarios: CreateDestinatarioDto[];
}

export class DestinatarioQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enviado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aberto?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  clicado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  limit?: number;
}
