import {
  Controller, Get, Post, Param, Query, Body, Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SugestaoCompraService } from './sugestao-compra.service';
import { GerarSugestoesDto, SugestaoCompraQueryDto } from './dto/create-sugestao-compra.dto';

@ApiTags('Sugestão de Compras')
@ApiBearerAuth()
@Controller('sugestoes-compra')
export class SugestaoCompraController {
  constructor(private readonly sugestaoCompraService: SugestaoCompraService) {}

  @Post('gerar')
  @ApiOperation({ summary: 'Gerar sugestões de compra baseadas no estoque' })
  async gerar(@Body() dto: GerarSugestoesDto) {
    return this.sugestaoCompraService.gerar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar sugestões de compra' })
  @ApiQuery({ name: 'processada', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: SugestaoCompraQueryDto) {
    const unidadeId = (query as any)['unidadeId'] || process.env.DEFAULT_UNIDADE_ID;
    return this.sugestaoCompraService.findAll(unidadeId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter sugestão de compra por ID' })
  async findOne(@Param('id') id: string) {
    return this.sugestaoCompraService.findOne(id);
  }

  @Patch(':id/processar')
  @ApiOperation({ summary: 'Marcar sugestão como processada' })
  async processar(@Param('id') id: string) {
    return this.sugestaoCompraService.processar(id);
  }
}
