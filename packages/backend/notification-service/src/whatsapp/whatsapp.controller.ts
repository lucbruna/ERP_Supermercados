import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';
import { SendWhatsAppDto } from '../dto/whatsapp.dto';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  @ApiBody({ type: SendWhatsAppDto })
  async send(@Body() dto: SendWhatsAppDto) {
    return this.whatsappService.send(dto.to, dto.message);
  }
}
