import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, ICurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sessões')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sessões do usuário' })
  async findAll(@CurrentUser() user: ICurrentUser) {
    return this.sessionService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da sessão' })
  async findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revogar sessão' })
  async revoke(@Param('id') id: string) {
    return this.sessionService.revoke(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Revogar todas as sessões' })
  async revokeAll(@CurrentUser() user: ICurrentUser) {
    return this.sessionService.revokeAll(user.id);
  }
}
