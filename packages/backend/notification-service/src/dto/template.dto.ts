import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { TipoNotificacao } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty() @IsString() companyId: string;
  @ApiProperty() @IsString() nome: string;
  @ApiProperty({ enum: TipoNotificacao }) @IsEnum(TipoNotificacao) tipo: TipoNotificacao;
  @ApiPropertyOptional() @IsOptional() @IsString() assunto?: string;
  @ApiProperty() @IsString() conteudo: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() variaveis?: string[];
}

export class UpdateTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;
  @ApiPropertyOptional({ enum: TipoNotificacao }) @IsOptional() @IsEnum(TipoNotificacao) tipo?: TipoNotificacao;
  @ApiPropertyOptional() @IsOptional() @IsString() assunto?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conteudo?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() variaveis?: string[];
}
