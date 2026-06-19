import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MfaService } from './mfa.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, ICurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('MFA / 2FA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Configurar MFA com TOTP' })
  async setup(@CurrentUser() user: ICurrentUser) {
    return this.mfaService.setupTotp(user.id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar código MFA' })
  async validate(@CurrentUser() user: ICurrentUser, @Body('token') token: string) {
    return this.mfaService.validateTotp(user.id, token);
  }

  @Delete()
  @ApiOperation({ summary: 'Desativar MFA' })
  async disable(@CurrentUser() user: ICurrentUser) {
    return this.mfaService.disable(user.id);
  }
}
