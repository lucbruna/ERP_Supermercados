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
import { TabelasPrecoService } from './tabelas-preco.service';
import { CreateTabelaPrecoDto } from './dto/create-tabela-preco.dto';
import { UpdateTabelaPrecoDto } from './dto/update-tabela-preco.dto';
import { QueryTabelaPrecoDto } from './dto/query-tabela-preco.dto';

@ApiTags('Tabelas de Preço')
@ApiBearerAuth()
@Controller('tabelas-preco')
export class TabelasPrecoController {
  constructor(private readonly service: TabelasPrecoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tabela de preço' })
  @ApiResponse({ status: 201, description: 'Tabela criada.' })
  create(@Body() dto: CreateTabelaPrecoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tabelas de preço (paginado)' })
  findAll(@Query() query: QueryTabelaPrecoDto) {
    return this.service.findAll(query);
  }

  @Get('fornecedor/:fornecedorId')
  @ApiOperation({ summary: 'Listar tabelas por fornecedor' })
  findByFornecedor(@Param('fornecedorId') fornecedorId: string) {
    return this.service.findByFornecedor(fornecedorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tabela por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tabela de preço' })
  update(@Param('id') id: string, @Body() dto: UpdateTabelaPrecoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar tabela de preço' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
