import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class PerguntaDto {
  @ApiProperty({ description: 'Pergunta em linguagem natural' })
  @IsString()
  @MinLength(2)
  pergunta: string;

  @ApiPropertyOptional({ description: 'Identificador do usuário' })
  @IsOptional()
  @IsString()
  usuario?: string;

  @ApiPropertyOptional({ description: 'ID da sessão para contexto' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class AnaliseSentimentoDto {
  @ApiProperty({ description: 'Texto para análise de sentimento' })
  @IsString()
  @MinLength(1)
  texto: string;
}

export class SugestaoAcaoDto {
  @ApiPropertyOptional({ description: 'Contexto específico' })
  @IsOptional()
  @IsString()
  contexto?: string;

  @ApiPropertyOptional({ description: 'Departamento foco' })
  @IsOptional()
  @IsString()
  departamento?: string;
}
