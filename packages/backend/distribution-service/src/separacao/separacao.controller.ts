import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SeparacaoService } from './separacao.service';
import { CreateSeparacaoDto, UpdateSeparacaoDto, SeparacaoQueryDto } from '../dto/separacao.dto';

@ApiTags('separacao')
@Controller('separacao')
export class SeparacaoController {
  constructor(private readonly service: SeparacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new picking order' })
  @ApiBody({ type: CreateSeparacaoDto })
  create(@Body() dto: CreateSeparacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all picking orders' })
  findAll(@Query() query: SeparacaoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get picking order by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a picking order' })
  @ApiBody({ type: UpdateSeparacaoDto })
  update(@Param('id') id: string, @Body() dto: UpdateSeparacaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a picking order' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start separation process' })
  startSeparation(@Param('id') id: string) {
    return this.service.startSeparation(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete separation' })
  completeSeparation(@Param('id') id: string) {
    return this.service.completeSeparation(id);
  }

  @Post(':id/start-conference')
  @ApiOperation({ summary: 'Start conference' })
  startConference(@Param('id') id: string) {
    return this.service.startConference(id);
  }

  @Post(':id/complete-conference')
  @ApiOperation({ summary: 'Complete conference' })
  completeConference(@Param('id') id: string, @Body('conferenteId') conferenteId: string) {
    return this.service.completeConference(id, conferenteId);
  }
}
