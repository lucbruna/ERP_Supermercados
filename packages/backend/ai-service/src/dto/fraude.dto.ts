import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { TipoDeteccaoFraude } from '@prisma/client';

export class AnalisarTransacaoDto {
  @ApiProperty() @IsString() transacaoId: string;
  @ApiProperty() @IsNumber() valor: number;
  @ApiProperty() @IsString() clienteId: string;
  @ApiProperty() @IsString() localizacao: string;
}

export class FraudeQueryDto {
  @ApiPropertyOptional({ enum: TipoDeteccaoFraude }) @IsOptional() @IsEnum(TipoDeteccaoFraude) tipo?: TipoDeteccaoFraude;
  @ApiPropertyOptional() @IsOptional() @IsString() processado?: string;
}
