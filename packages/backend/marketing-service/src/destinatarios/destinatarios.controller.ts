import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DestinatariosService } from './destinatarios.service';
import {
  CreateDestinatarioDto, CreateDestinatariosBatchDto, DestinatarioQueryDto,
} from './dto/create-destinatario.dto';

@ApiTags('Destinatários')
@ApiBearerAuth()
@Controller('destinatarios')
export class DestinatariosController {
  constructor(private readonly destinatariosService: DestinatariosService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar destinatário à campanha' })
  async create(@Body() dto: CreateDestinatarioDto) {
    return this.destinatariosService.create(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Adicionar múltiplos destinatários' })
  async createBatch(@Body() dto: CreateDestinatariosBatchDto) {
    return this.destinatariosService.createBatch(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar destinatários' })
  async findAll(@Query() query: DestinatarioQueryDto) {
    return this.destinatariosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter destinatário por ID' })
  async findOne(@Param('id') id: string) {
    return this.destinatariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar destinatário' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateDestinatarioDto>) {
    return this.destinatariosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover destinatário' })
  async remove(@Param('id') id: string) {
    return this.destinatariosService.remove(id);
  }

  @Post(':id/marcar-abertura')
  @ApiOperation({ summary: 'Marcar destinatário como tendo aberto' })
  async marcarAbertura(@Param('id') id: string) {
    return this.destinatariosService.marcarAbertura(id);
  }

  @Post(':id/marcar-clique')
  @ApiOperation({ summary: 'Marcar destinatário como tendo clicado' })
  async marcarClique(@Param('id') id: string) {
    return this.destinatariosService.marcarClique(id);
  }
}
