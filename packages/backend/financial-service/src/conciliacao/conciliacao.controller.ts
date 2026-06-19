import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConciliacaoService } from './conciliacao.service';
import { CreateConciliacaoDto, UpdateConciliacaoDto, QueryConciliacaoDto } from './dto/conciliacao.dto';

@ApiTags('Conciliação Bancária')
@ApiBearerAuth()
@Controller('conciliacao')
export class ConciliacaoController {
  constructor(private readonly service: ConciliacaoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Iniciar nova conciliação bancária' })
  async create(@Body() dto: CreateConciliacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar conciliações bancárias' })
  async findAll(@Query() query: QueryConciliacaoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conciliação por ID' })
  @ApiResponse({ status: 404, description: 'Conciliação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conciliação' })
  async update(@Param('id') id: string, @Body() dto: UpdateConciliacaoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/conciliar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar conciliação' })
  async conciliar(@Param('id') id: string) {
    return this.service.conciliar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover conciliação' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
