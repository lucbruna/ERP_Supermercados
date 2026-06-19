import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { KpisService } from './kpis.service';
import { CreateKpiDto, UpdateKpiDto, KpiQueryDto } from '../dto/kpi.dto';

@ApiTags('kpis')
@Controller('kpis')
export class KpisController {
  constructor(private readonly service: KpisService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new KPI' })
  @ApiBody({ type: CreateKpiDto })
  create(@Body() dto: CreateKpiDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all KPIs' })
  findAll(@Query() query: KpiQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KPI by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a KPI' })
  @ApiBody({ type: UpdateKpiDto })
  update(@Param('id') id: string, @Body() dto: UpdateKpiDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a KPI' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate all KPIs for a company' })
  calculate(@Query('companyId') companyId: string, @Query('categoria') categoria?: string) {
    return this.service.calculate(companyId, categoria);
  }
}
