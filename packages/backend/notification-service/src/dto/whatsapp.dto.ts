import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendWhatsAppDto {
  @ApiProperty() @IsString() to: string;
  @ApiProperty() @IsString() message: string;
}
