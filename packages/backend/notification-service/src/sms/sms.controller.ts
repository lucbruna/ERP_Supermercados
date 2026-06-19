import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendSmsDto } from '../dto/sms.dto';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Send an SMS' })
  @ApiBody({ type: SendSmsDto })
  async send(@Body() dto: SendSmsDto) {
    return this.smsService.send(dto.to, dto.message);
  }
}
