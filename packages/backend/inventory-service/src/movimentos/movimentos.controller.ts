import {
  Controller, Get, Post, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MovimentosService } from './movimentos.service';
import { CreateMovimentoDto, MovimentoQueryDto } from './dto/create-movimento.dto';

@ApiTags('Movimentos de Estoque')
@ApiBearerAuth()
@Controller('movimentos')
export class MovimentosController {
  constructor(private readonly movimentosService: MovimentosService) {}

  @Post('entrada')
  @ApiOperation({ summary: 'Registrar entrada de estoque' })
  async entrada(@Body() dto: CreateMovimentoDto) {
    return this.movimentosService.registrarMovimento({ ...dto, tipo: 'ENTRADA' });
  }

  @Post('saida')
  @ApiOperation({ summary: 'Registrar saída de estoque' })
  async saida(@Body() dto: CreateMovimentoDto) {
    return this.movimentosService.registrarMovimento({ ...dto, tipo: 'SAIDA' });
  }

  @Post('ajuste')
  @ApiOperation({ summary: 'Registrar ajuste de estoque' })
  async ajuste(@Body() dto: CreateMovimentoDto) {
    return this.movimentosService.registrarMovimento({ ...dto, tipo: 'AJUSTE' });
  }

  @Get()
  @ApiOperation({ summary: 'Listar movimentos de estoque' })
  @ApiQuery({ name: 'produtoId', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: MovimentoQueryDto) {
    const unidadeId = (query as any)['unidadeId'] || process.env.DEFAULT_UNIDADE_ID;
    return this.movimentosService.findAll(unidadeId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter movimento por ID' })
  async findOne(@Param('id') id: string) {
    return this.movimentosService.findOne(id);
  }
}
