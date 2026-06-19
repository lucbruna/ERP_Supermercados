import { Controller, Get, Post, Patch, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { CriarAlertaDto, AlertaQueryDto } from './dto/alerta.dto';

@ApiTags('Alertas CFTV')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: AlertaQueryDto,
  ) {
    return this.alertasService.findAll(companyId, query);
  }

  @Get('nao-enviados')
  @ApiOperation({ summary: 'Alertas não enviados' })
  async getNaoEnviados() {
    return this.alertasService.getNaoEnviados();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do alerta' })
  async findOne(@Param('id') id: string) {
    return this.alertasService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar alerta' })
  async create(@Body() dto: CriarAlertaDto) {
    return this.alertasService.create(dto);
  }

  @Patch(':id/enviado')
  @ApiOperation({ summary: 'Marcar alerta como enviado' })
  async marcarEnviado(@Param('id') id: string) {
    return this.alertasService.marcarEnviado(id);
  }
}
