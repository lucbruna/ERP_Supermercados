import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotifyDto } from '../dto/notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('enviar')
  @ApiOperation({ summary: 'Send notification (auto-detect channel)' })
  @ApiBody({ type: NotifyDto })
  async send(@Body() dto: NotifyDto) {
    switch (dto.channel) {
      case 'email':
        return this.notificationsService.notifyEmail(dto.to, dto.subject, dto.template, dto.context);
      case 'sms':
        return this.notificationsService.notifySms(dto.to, dto.message);
      case 'whatsapp':
        return this.notificationsService.notifyWhatsapp(dto.to, dto.message);
      case 'push':
        return this.notificationsService.notifyPush(dto.token || dto.to, { title: dto.subject || dto.message, body: dto.message, data: dto.context as Record<string, string> });
      case 'all':
        return this.notificationsService.notifyAll(dto.to, dto.subject, dto.message);
      default:
        return { success: false, error: `Unknown channel: ${dto.channel}` };
    }
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get notification status by ID' })
  async getStatus(@Param('id') id: string) {
    return this.notificationsService.getNotificationStatus(id);
  }
}
