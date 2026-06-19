import { IsString, IsEnum, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoProgramaFidelidade } from '@prisma/client';

export class CreateFidelidadeDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ enum: TipoProgramaFidelidade })
  @IsEnum(TipoProgramaFidelidade)
  tipo: TipoProgramaFidelidade;

  @ApiProperty({ type: [Object] })
  @IsArray()
  regras: any[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
