import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VendasService } from './vendas.service';
import {
  CreateVendaDto,
  FinalizarVendaDto,
  CancelarVendaDto,
  VendaQueryDto,
} from './dto/venda.dto';

@ApiTags('Vendas')
@ApiBearerAuth()
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova venda' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso' })
  async create(@Body() dto: CreateVendaDto) {
    return this.vendasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vendas' })
  async findAll(@Query() query: VendaQueryDto) {
    return this.vendasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter venda por ID' })
  async findOne(@Param('id') id: string) {
    return this.vendasService.findOne(id);
  }

  @Post(':id/finalizar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalizar venda' })
  async finalizar(@Param('id') id: string, @Body() dto: FinalizarVendaDto) {
    return this.vendasService.finalizar(id, dto);
  }

  @Post(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar venda' })
  async cancelar(@Param('id') id: string, @Body() dto: CancelarVendaDto) {
    return this.vendasService.cancelar(id, dto);
  }

  @Post(':id/suspender')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspender venda (hold)' })
  async suspender(@Param('id') id: string) {
    return this.vendasService.suspender(id);
  }

  @Post(':id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reativar venda suspensa' })
  async reativar(@Param('id') id: string) {
    return this.vendasService.reativar(id);
  }

  @Get('suspensas/listar')
  @ApiOperation({ summary: 'Listar vendas suspensas' })
  async listarSuspensas(@Query() query: VendaQueryDto) {
    return this.vendasService.listarSuspensas(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover venda' })
  async remove(@Param('id') id: string) {
    return this.vendasService.remove(id);
  }
}
