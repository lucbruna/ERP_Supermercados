import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto, QueryCategoriaDto } from './dto/categoria.dto';

@ApiTags('Categorias Financeiras')
@ApiBearerAuth()
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova categoria financeira' })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiResponse({ status: 409, description: 'Categoria já existe' })
  async create(@Body() dto: CreateCategoriaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias financeiras' })
  async findAll(@Query() query: QueryCategoriaDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria financeira' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar categoria financeira' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
