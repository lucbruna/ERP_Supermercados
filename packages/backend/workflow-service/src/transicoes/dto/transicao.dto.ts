import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateTransicaoDto {
  @ApiProperty() @IsString() estadoOrigemId: string;

  @ApiProperty() @IsString() estadoDestinoId: string;

  @ApiProperty() @IsString() nome: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() condicaoJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsObject() acaoJson?: Record<string, any>;
}

export class UpdateTransicaoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() estadoDestinoId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() nome?: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() condicaoJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsObject() acaoJson?: Record<string, any>;
}

export class ExecutarTransicaoDto {
  @ApiProperty() @IsString() transicaoId: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() dadosJson?: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;
}
