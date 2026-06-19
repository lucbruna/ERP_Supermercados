import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TarefaStatus } from '../../common/enums';

export class CreateTarefaDto {
  @ApiProperty() @IsString() instanciaId: string;

  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;

  @ApiProperty() @IsString() titulo: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() dataLimite?: string;
}

export class TarefaQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() usuarioId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() instanciaId?: string;
}
