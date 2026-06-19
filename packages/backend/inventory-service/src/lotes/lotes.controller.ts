import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LotesService } from './lotes.service';
import { CreateLoteDto, LoteQueryDto, BaixaLoteDto } from './dto/create-lote.dto';

@ApiTags('Lotes')
@ApiBearerAuth()
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo lote' })
  async create(@Body() dto: CreateLoteDto) {
    return this.lotesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lotes' })
  @ApiQuery({ name: 'produtoId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: LoteQueryDto) {
    return this.lotesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter lote por ID' })
  async findOne(@Param('id') id: string) {
    return this.lotesService.findOne(id);
  }

  @Patch(':id/baixar')
  @ApiOperation({ summary: 'Baixar quantidade do lote' })
  async baixar(@Param('id') id: string, @Body() dto: BaixaLoteDto) {
    return this.lotesService.baixar(id, dto.quantidade);
  }

  @Get('validade/proximos-vencer')
  @ApiOperation({ summary: 'Listar lotes próximos ao vencimento' })
  @ApiQuery({ name: 'dias', required: false })
  async proximosVencer(@Query('dias') dias?: number) {
    return this.lotesService.proximosVencer(dias || 30);
  }
}
