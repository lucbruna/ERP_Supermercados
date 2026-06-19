import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto, CategoriaQueryDto } from './dto/create-categoria.dto';

@ApiTags('Categorias de Produtos')
@ApiBearerAuth()
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  async create(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: CategoriaQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.categoriasService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.categoriasService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria (desativa)' })
  async remove(@Param('id') id: string) {
    return this.categoriasService.remove(id);
  }
}
