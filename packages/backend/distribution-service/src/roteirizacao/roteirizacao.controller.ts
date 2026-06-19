import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RoteirizacaoService } from './roteirizacao.service';
import { CreateRoteirizacaoDto, UpdateRoteirizacaoDto, OtimizacaoDto } from '../dto/roteirizacao.dto';

@ApiTags('roteirizacao')
@Controller('roteirizacao')
export class RoteirizacaoController {
  constructor(private readonly service: RoteirizacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new route' })
  @ApiBody({ type: CreateRoteirizacaoDto })
  create(@Body() dto: CreateRoteirizacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all routes' })
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a route' })
  @ApiBody({ type: UpdateRoteirizacaoDto })
  update(@Param('id') id: string, @Body() dto: UpdateRoteirizacaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a route' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start route execution' })
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post(':id/finish')
  @ApiOperation({ summary: 'Finish route' })
  finish(@Param('id') id: string) {
    return this.service.finish(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel route' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize route with best sequence' })
  @ApiBody({ type: OtimizacaoDto })
  optimize(@Body() dto: OtimizacaoDto) {
    return this.service.optimize(dto.origemUnidadeId, dto.entregas, dto.motoristaId, dto.veiculoId);
  }
}
