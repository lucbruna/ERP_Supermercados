import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RotasService } from './rotas.service';
import { CreateRotaDto, UpdateRotaDto, ConcluirRotaDto, RotaQueryDto } from './dto/rotas.dto';

@ApiTags('Rotas')
@ApiBearerAuth()
@Controller('rotas')
export class RotasController {
  constructor(private readonly service: RotasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar rota' })
  async create(@Body() dto: CreateRotaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar rotas' })
  async findAll(@Query() query: RotaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter rota por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar rota' })
  async update(@Param('id') id: string, @Body() dto: UpdateRotaDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/iniciar')
  @ApiOperation({ summary: 'Iniciar rota' })
  async iniciar(@Param('id') id: string) {
    return this.service.iniciar(id);
  }

  @Post(':id/concluir')
  @ApiOperation({ summary: 'Concluir rota (atualiza km automático)' })
  async concluir(@Param('id') id: string, @Body() dto: ConcluirRotaDto) {
    return this.service.concluir(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover rota' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
