import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSegmentoDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty({ type: [Object], description: 'Array de critérios para classificação' })
  @IsArray()
  criterios: any[];
}
