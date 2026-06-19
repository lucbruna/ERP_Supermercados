import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EtiquetasService } from './etiquetas.service';
import { CreateEtiquetaDto, UpdateEtiquetaDto, PreviewEtiquetaDto } from './dto/create-etiqueta.dto';

@ApiTags('Etiquetas')
@ApiBearerAuth()
@Controller('etiquetas')
export class EtiquetasController {
  constructor(private readonly etiquetasService: EtiquetasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo template de etiqueta' })
  async create(@Body() dto: CreateEtiquetaDto) {
    return this.etiquetasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os templates de etiqueta' })
  async findAll() {
    return this.etiquetasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter etiqueta por ID' })
  async findOne(@Param('id') id: string) {
    return this.etiquetasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar template de etiqueta' })
  async update(@Param('id') id: string, @Body() dto: UpdateEtiquetaDto) {
    return this.etiquetasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover template de etiqueta' })
  async remove(@Param('id') id: string) {
    return this.etiquetasService.remove(id);
  }

  @Post(':id/previsualizar')
  @ApiOperation({ summary: 'Gerar preview da etiqueta com código de barras de exemplo' })
  async preview(@Param('id') id: string, @Body() dto: PreviewEtiquetaDto) {
    return this.etiquetasService.preview(id, dto);
  }

  @Post(':id/imprimir')
  @ApiOperation({ summary: 'Gerar versão para impressão da etiqueta' })
  async imprimir(
    @Param('id') id: string,
    @Body() body: { produtoIds: string[]; quantidade: number },
  ) {
    return this.etiquetasService.imprimir(id, body.produtoIds, body.quantidade);
  }
}
