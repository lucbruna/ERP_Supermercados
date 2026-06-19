import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsInt } from 'class-validator';

export class RegistrarRegraDto {
  @ApiProperty() @IsString() workflowId: string;

  @ApiProperty() @IsString() nome: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiProperty() @IsObject() condicaoJson: Record<string, any>;

  @ApiPropertyOptional() @IsOptional() @IsInt() prioridade?: number;

  @ApiPropertyOptional() @IsOptional() @IsObject() config?: Record<string, any>;
}

export class DispararAutomacaoDto {
  @ApiProperty() @IsString() entidadeTipo: string;

  @ApiProperty() @IsString() entidadeId: string;

  @ApiPropertyOptional() @IsOptional() @IsObject() dadosJson?: Record<string, any>;
}

export class RegraQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() entidadeTipo?: string;
}
