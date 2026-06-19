import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampanhasService } from './campanhas.service';
import {
  CreateCampanhaDto, UpdateCampanhaDto, CampanhaQueryDto,
  EnviarCampanhaDto, CampanhaMetricasDto,
} from './dto/create-campanha.dto';

@ApiTags('Campanhas')
@ApiBearerAuth()
@Controller('campanhas')
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova campanha' })
  async create(@Body() dto: CreateCampanhaDto) {
    return this.campanhasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campanhas' })
  async findAll(@Query() query: CampanhaQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.campanhasService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter campanha por ID' })
  async findOne(@Param('id') id: string) {
    return this.campanhasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar campanha' })
  async update(@Param('id') id: string, @Body() dto: UpdateCampanhaDto) {
    return this.campanhasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover campanha' })
  async remove(@Param('id') id: string) {
    return this.campanhasService.remove(id);
  }

  @Post(':id/enviar')
  @ApiOperation({ summary: 'Enviar campanha (disparo imediato ou agendado)' })
  async enviar(@Param('id') id: string, @Body() dto: EnviarCampanhaDto) {
    return this.campanhasService.enviar(id, dto);
  }

  @Patch(':id/metricas')
  @ApiOperation({ summary: 'Atualizar métricas da campanha' })
  async updateMetricas(
    @Param('id') id: string,
    @Body() dto: CampanhaMetricasDto,
  ) {
    return this.campanhasService.updateMetricas(id, dto);
  }
}
