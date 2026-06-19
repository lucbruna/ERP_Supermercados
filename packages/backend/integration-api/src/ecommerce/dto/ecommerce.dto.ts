import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIntegracaoDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() plataforma: string;
  @ApiProperty() @IsUrl() url: string;
  @ApiProperty() @IsString() apiKey: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apiSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() webhookSecret?: string;
}

export class UpdateIntegracaoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() plataforma?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() apiSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() webhookSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() ativo?: boolean;
}

export class SincronizarDto {
  @ApiProperty() @IsString() tipo: string; // PRODUTO, ESTOQUE, PRECO, PEDIDO
}
