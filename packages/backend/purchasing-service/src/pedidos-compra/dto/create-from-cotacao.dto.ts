import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateFromCotacaoDto {
  @ApiProperty() @IsString() @IsNotEmpty() cotacaoId: string;
  @ApiProperty() @IsString() @IsNotEmpty() unidadeId: string;
  @ApiProperty() @IsDateString() dataEntregaPrevista: string;
}
