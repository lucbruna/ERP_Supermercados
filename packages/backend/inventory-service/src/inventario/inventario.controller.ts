import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto, RealizarContagemDto, FecharInventarioDto, InventarioQueryDto } from './dto/create-inventario.dto';

@ApiTags('Inventário')
@ApiBearerAuth()
@Controller('inventarios')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo inventário' })
  async create(@Body() dto: CreateInventarioDto) {
    return this.inventarioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar inventários' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: InventarioQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.inventarioService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter inventário por ID' })
  async findOne(@Param('id') id: string) {
    return this.inventarioService.findOne(id);
  }

  @Patch(':id/contagem')
  @ApiOperation({ summary: 'Registrar contagem do inventário' })
  async realizarContagem(@Param('id') id: string, @Body() dto: RealizarContagemDto) {
    return this.inventarioService.realizarContagem(id, dto);
  }

  @Patch(':id/fechar')
  @ApiOperation({ summary: 'Fechar inventário' })
  async fechar(@Param('id') id: string, @Body() dto: FecharInventarioDto) {
    return this.inventarioService.fechar(id, dto);
  }

  @Post(':id/ajustar')
  @ApiOperation({ summary: 'Ajustar estoque com base no inventário' })
  async ajustar(@Param('id') id: string) {
    return this.inventarioService.ajustar(id);
  }
}
