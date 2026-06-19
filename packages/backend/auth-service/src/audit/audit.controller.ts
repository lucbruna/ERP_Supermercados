import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, ICurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  async findAll(
    @CurrentUser() user: ICurrentUser,
    @Query() query: { page?: number; limit?: number; gravidade?: string; recurso?: string; userId?: string },
  ) {
    return this.auditService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do log de auditoria' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
