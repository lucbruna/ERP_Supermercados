import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PushService } from './push.service';
import { SendPushDto } from '../dto/push.dto';

@ApiTags('push')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Send a push notification' })
  @ApiBody({ type: SendPushDto })
  async send(@Body() dto: SendPushDto) {
    if (dto.topic) {
      return this.pushService.sendToTopic(dto.topic, { title: dto.title, body: dto.body, data: dto.data });
    }
    return this.pushService.sendToDevice(dto.token, { title: dto.title, body: dto.body, data: dto.data });
  }
}
