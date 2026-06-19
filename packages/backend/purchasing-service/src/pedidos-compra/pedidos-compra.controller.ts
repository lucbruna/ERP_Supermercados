import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PedidosCompraService } from './pedidos-compra.service';
import { CreatePedidoCompraDto } from './dto/create-pedido-compra.dto';
import { CreateFromCotacaoDto } from './dto/create-from-cotacao.dto';
import { UpdatePedidoCompraDto } from './dto/update-pedido-compra.dto';
import { QueryPedidoCompraDto } from './dto/query-pedido-compra.dto';
import { AprovarPedidoDto } from './dto/aprovar-pedido.dto';
import { RejeitarPedidoDto } from './dto/rejeitar-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';

@ApiTags('Pedidos de Compra')
@ApiBearerAuth()
@Controller('pedidos-compra')
export class PedidosCompraController {
  constructor(private readonly service: PedidosCompraService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pedido de compra' })
  @ApiResponse({ status: 201, description: 'Pedido criado.' })
  create(@Body() dto: CreatePedidoCompraDto) {
    return this.service.create(dto);
  }

  @Post('from-cotacao')
  @ApiOperation({ summary: 'Criar pedido a partir de cotação aprovada' })
  createFromCotacao(@Body() dto: CreateFromCotacaoDto) {
    return this.service.createFromCotacao(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos de compra (paginado)' })
  findAll(@Query() query: QueryPedidoCompraDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter pedido por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  update(@Param('id') id: string, @Body() dto: UpdatePedidoCompraDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/enviar-aprovacao')
  @ApiOperation({ summary: 'Enviar pedido para aprovação' })
  enviarParaAprovacao(@Param('id') id: string) {
    return this.service.enviarParaAprovacao(id);
  }

  @Post(':id/aprovar')
  @ApiOperation({ summary: 'Aprovar pedido (aprovação hierárquica)' })
  aprovar(@Param('id') id: string, @Body() dto: AprovarPedidoDto) {
    return this.service.aprovar(id, dto);
  }

  @Post(':id/rejeitar')
  @ApiOperation({ summary: 'Rejeitar pedido' })
  rejeitar(@Param('id') id: string, @Body() dto: RejeitarPedidoDto) {
    return this.service.rejeitar(id, dto);
  }

  @Post(':id/enviar-fornecedor')
  @ApiOperation({ summary: 'Enviar pedido ao fornecedor' })
  enviarParaFornecedor(@Param('id') id: string) {
    return this.service.enviarParaFornecedor(id);
  }

  @Post(':id/receber')
  @ApiOperation({ summary: 'Registrar recebimento do pedido' })
  receberPedido(@Param('id') id: string, @Body() dto: ReceberPedidoDto) {
    return this.service.receberPedido(id, dto);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar pedido' })
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar pedido (soft delete)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
