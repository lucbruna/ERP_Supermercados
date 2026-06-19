import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FolhaService } from './folha.service';
import { CreateFolhaPagamentoDto, UpdateFolhaPagamentoDto, FolhaQueryDto, CalcularFolhaDto } from './dto/create-folha.dto';

@ApiTags('Folha de Pagamento')
@ApiBearerAuth()
@Controller('folha')
export class FolhaController {
  constructor(private readonly folhaService: FolhaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar folha de pagamento manualmente' })
  async create(@Body() dto: CreateFolhaPagamentoDto) {
    return this.folhaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar folhas de pagamento' })
  async findAll(@Query() query: FolhaQueryDto) {
    return this.folhaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter folha de pagamento por ID' })
  async findOne(@Param('id') id: string) {
    return this.folhaService.findOne(id);
  }

  @Post('calcular')
  @ApiOperation({ summary: 'Calcular folha de pagamento automaticamente' })
  async calcular(@Body() dto: CalcularFolhaDto) {
    return this.folhaService.calcular(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar folha de pagamento' })
  async update(@Param('id') id: string, @Body() dto: UpdateFolhaPagamentoDto) {
    return this.folhaService.update(id, dto);
  }

  @Patch(':id/fechar')
  @ApiOperation({ summary: 'Fechar folha de pagamento' })
  async fechar(@Param('id') id: string) {
    return this.folhaService.fechar(id);
  }

  @Patch(':id/pagar')
  @ApiOperation({ summary: 'Marcar folha como paga' })
  async pagar(@Param('id') id: string, @Body('dataPagamento') dataPagamento?: string) {
    return this.folhaService.pagar(id, dataPagamento);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar folha de pagamento' })
  async cancelar(@Param('id') id: string) {
    return this.folhaService.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover folha de pagamento' })
  async remove(@Param('id') id: string) {
    return this.folhaService.remove(id);
  }
}
