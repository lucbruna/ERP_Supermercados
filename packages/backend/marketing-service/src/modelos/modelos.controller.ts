import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModelosService } from './modelos.service';
import { CreateModeloDto, UpdateModeloDto, ModeloQueryDto } from './dto/create-modelo.dto';

@ApiTags('Modelos de Mensagem')
@ApiBearerAuth()
@Controller('modelos')
export class ModelosController {
  constructor(private readonly modelosService: ModelosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar modelo de mensagem' })
  async create(@Body() dto: CreateModeloDto) {
    return this.modelosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar modelos' })
  async findAll(@Query() query: ModeloQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.modelosService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter modelo por ID' })
  async findOne(@Param('id') id: string) {
    return this.modelosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar modelo' })
  async update(@Param('id') id: string, @Body() dto: UpdateModeloDto) {
    return this.modelosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover modelo' })
  async remove(@Param('id') id: string) {
    return this.modelosService.remove(id);
  }
}
