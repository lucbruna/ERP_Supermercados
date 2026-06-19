import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConveniosService } from './convenios.service';
import { CreateConvenioDto, UpdateConvenioDto, ConvenioQueryDto } from './dto/convenios.dto';

@ApiTags('Convênios')
@ApiBearerAuth()
@Controller()
export class ConveniosController {
  constructor(private readonly service: ConveniosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar convênio' })
  async create(@Body() dto: CreateConvenioDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar convênios' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(@Query() query: ConvenioQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter convênio por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Dashboard do convênio' })
  async dashboard(@Param('id') id: string) {
    return this.service.dashboard(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar convênio' })
  async update(@Param('id') id: string, @Body() dto: UpdateConvenioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover convênio' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
