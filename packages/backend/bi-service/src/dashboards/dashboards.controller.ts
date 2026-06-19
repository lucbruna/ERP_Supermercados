import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto, UpdateDashboardDto } from '../dto/dashboard.dto';

@ApiTags('dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard configuration' })
  @ApiBody({ type: CreateDashboardDto })
  create(@Body() dto: CreateDashboardDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all dashboards' })
  findAll(@Query('companyId') companyId?: string, @Query('ativo') ativo?: string) {
    return this.service.findAll(companyId, ativo === 'true' ? true : ativo === 'false' ? false : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  @ApiBody({ type: UpdateDashboardDto })
  update(@Param('id') id: string, @Body() dto: UpdateDashboardDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get(':id/render')
  @ApiOperation({ summary: 'Render dashboard with KPI data' })
  render(@Param('id') id: string) {
    return this.service.render(id);
  }
}
