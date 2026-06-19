import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './chatbot.dto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly service: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Process a chatbot message and return intent + response' })
  processMessage(@Body() dto: ChatMessageDto) {
    return this.service.processMessage(dto.message, dto.sessionId);
  }
}
