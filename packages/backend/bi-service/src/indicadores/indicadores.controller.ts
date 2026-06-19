import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { IndicadoresService } from './indicadores.service';
import { CreateIndicadorDto, UpdateIndicadorDto } from '../dto/indicador.dto';

@ApiTags('indicadores')
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly service: IndicadoresService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new indicator' })
  @ApiBody({ type: CreateIndicadorDto })
  create(@Body() dto: CreateIndicadorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all indicators' })
  findAll(@Query('companyId') companyId?: string, @Query('categoria') categoria?: string) {
    return this.service.findAll(companyId, categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get indicator by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an indicator' })
  @ApiBody({ type: UpdateIndicadorDto })
  update(@Param('id') id: string, @Body() dto: UpdateIndicadorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an indicator' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
