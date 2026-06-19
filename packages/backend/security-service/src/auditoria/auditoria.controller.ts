import { Controller, Get, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaQueryDto, AuditoriaExportDto } from './dto/auditoria-query.dto';

@ApiTags('Auditoria de Segurança')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: AuditoriaQueryDto,
  ) {
    return this.auditoriaService.findAll(companyId, query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo dos logs de auditoria' })
  async resumo(@Headers('x-company-id') companyId: string) {
    return this.auditoriaService.getResumo(companyId);
  }

  @Get('exportar')
  @ApiOperation({ summary: 'Exportar logs de auditoria' })
  async export(
    @Headers('x-company-id') companyId: string,
    @Query() filters: AuditoriaExportDto,
  ) {
    return this.auditoriaService.export(companyId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do log de auditoria' })
  async findOne(@Param('id') id: string) {
    return this.auditoriaService.findOne(id);
  }

  @Post('registrar')
  @ApiOperation({ summary: 'Registrar evento de auditoria' })
  async registrar(
    @Headers('x-company-id') companyId: string,
    @Body() dto: {
      usuarioId: string;
      acao: string;
      recurso: string;
      recursoId?: string;
      ip: string;
      userAgent: string;
      tipo?: string;
      gravidade?: string;
      detalhes?: string;
      metadata?: any;
    },
  ) {
    return this.auditoriaService.registrar({ ...dto, companyId });
  }
}
