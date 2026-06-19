import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ImpressoesService } from './impressoes.service';
import { CreateImpressaoDto, UpdateImpressaoStatusDto } from './dto/create-impressao.dto';
import { StatusImpressao } from '@prisma/client';

@ApiTags('Impressões de Etiquetas')
@ApiBearerAuth()
@Controller('impressoes')
export class ImpressoesController {
  constructor(private readonly impressoesService: ImpressoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar job de impressão de etiquetas' })
  async create(@Body() dto: CreateImpressaoDto) {
    return this.impressoesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de impressões com filtros' })
  @ApiQuery({ name: 'status', required: false, enum: StatusImpressao })
  @ApiQuery({ name: 'usuarioId', required: false })
  @ApiQuery({ name: 'etiquetaId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: StatusImpressao,
    @Query('usuarioId') usuarioId?: string,
    @Query('etiquetaId') etiquetaId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.impressoesService.findAll({ status, usuarioId, etiquetaId, page, limit });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status de impressão' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateImpressaoStatusDto) {
    return this.impressoesService.updateStatus(id, dto);
  }
}
