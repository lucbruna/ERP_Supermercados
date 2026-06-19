import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class RenovarContratoDto {
  @ApiProperty() @IsDateString() @IsNotEmpty() novaDataInicio: string;
  @ApiProperty() @IsDateString() @IsNotEmpty() novaDataFim: string;
}
