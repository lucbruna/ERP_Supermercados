import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto, UpdateProdutoDto, ProdutoQueryDto } from './dto/create-produto.dto';

@ApiTags('Produtos')
@ApiBearerAuth()
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  async create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos com filtros' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoriaId', required: false })
  @ApiQuery({ name: 'marca', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'ativo', required: false })
  @ApiQuery({ name: 'estoqueBaixo', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: ProdutoQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.produtosService.findAll(companyId, query);
  }

  @Get('codigo-barras/:codigo')
  @ApiOperation({ summary: 'Buscar produto por código de barras' })
  async findByBarcode(@Param('codigo') codigo: string) {
    return this.produtosService.findByBarcode(codigo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter produto por ID' })
  async findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  async update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto (desativa)' })
  async remove(@Param('id') id: string) {
    return this.produtosService.remove(id);
  }
}
