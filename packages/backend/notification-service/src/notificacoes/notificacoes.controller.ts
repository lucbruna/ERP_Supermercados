import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto, NotificacaoQueryDto, SendNotificacaoDto } from '../dto/notificacao.dto';
import { NotificationQueueService } from '../services/notification-queue.service';

@ApiTags('notificacoes')
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly service: NotificacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificacaoDto })
  create(@Body() dto: CreateNotificacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all notifications' })
  findAll(@Query() query: NotificacaoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a notification via specified channel' })
  @ApiBody({ type: SendNotificacaoDto })
  send(@Body() dto: SendNotificacaoDto) {
    return this.service.send(dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@Query('companyId') companyId: string, @Query('usuarioId') usuarioId?: string) {
    return this.service.markAllRead(companyId, usuarioId);
  }
}

@ApiTags('fila-envio')
@Controller('fila-envio')
export class FilaEnvioController {
  constructor(private readonly queue: NotificationQueueService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process pending notification queue' })
  processQueue() {
    return this.queue.processQueue();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get queue statistics' })
  getStats() {
    return this.queue.getQueueStats();
  }
}
