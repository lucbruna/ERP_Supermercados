import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BloqueioService } from './bloqueio.service';
import { CriarBloqueioDto, AtualizarBloqueioDto } from './dto/bloqueio.dto';

@ApiTags('Bloqueio de IPs')
@ApiBearerAuth()
@Controller('bloqueios')
export class BloqueioController {
  constructor(private readonly bloqueioService: BloqueioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bloqueios de IP' })
  async findAll(@Query() query: { page?: number; limit?: number; ativo?: boolean; ip?: string }) {
    return this.bloqueioService.findAll(query);
  }

  @Get('verificar/:ip')
  @ApiOperation({ summary: 'Verificar se IP está bloqueado' })
  async verificarIp(@Param('ip') ip: string) {
    return this.bloqueioService.verificarIp(ip);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do bloqueio' })
  async findOne(@Param('id') id: string) {
    return this.bloqueioService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar bloqueio de IP' })
  async create(@Body() dto: CriarBloqueioDto) {
    return this.bloqueioService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar bloqueio de IP' })
  async update(@Param('id') id: string, @Body() dto: AtualizarBloqueioDto) {
    return this.bloqueioService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover bloqueio de IP' })
  async remove(@Param('id') id: string) {
    return this.bloqueioService.remove(id);
  }
}
