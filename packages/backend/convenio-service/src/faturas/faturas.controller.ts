import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FaturasService } from './faturas.service';
import { CreateFaturaDto, PagarFaturaDto, FaturaQueryDto } from './dto/faturas.dto';

@ApiTags('Faturas')
@ApiBearerAuth()
@Controller()
export class FaturasController {
  constructor(private readonly service: FaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar fatura' })
  async create(@Body() dto: CreateFaturaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar faturas' })
  async findAll(@Query() query: FaturaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter fatura por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/pagar')
  @ApiOperation({ summary: 'Registrar pagamento da fatura' })
  async pagar(@Param('id') id: string, @Body() dto: PagarFaturaDto) {
    return this.service.pagar(id, dto);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar fatura' })
  async cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }

  @Post(':id/gerar-boletos')
  @ApiOperation({ summary: 'Gerar boletos para a fatura' })
  async gerarBoletos(@Param('id') id: string) {
    return this.service.gerarBoletos(id);
  }
}
