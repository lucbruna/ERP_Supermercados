import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';
import { CreateRelatorioDto, UpdateRelatorioDto, GerarRelatorioDto } from '../dto/relatorio.dto';

@ApiTags('relatorios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report configuration' })
  @ApiBody({ type: CreateRelatorioDto })
  create(@Body() dto: CreateRelatorioDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all reports' })
  findAll(@Query('companyId') companyId?: string, @Query('tipo') tipo?: string) {
    return this.service.findAll(companyId, tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiBody({ type: UpdateRelatorioDto })
  update(@Param('id') id: string, @Body() dto: UpdateRelatorioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate report data' })
  generate(@Param('id') id: string, @Body('filtros') filtros?: string[]) {
    return this.service.generate(id, filtros);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate report from filters' })
  @ApiBody({ type: GerarRelatorioDto })
  generateFromDto(@Body() dto: GerarRelatorioDto) {
    return this.service.generateFromDto(dto);
  }
}
