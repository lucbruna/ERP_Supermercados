import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContasPagarService } from './contas-pagar.service';
import { CreateContaPagarDto, UpdateContaPagarDto, QueryContaPagarDto, BaixaContaPagarDto } from './dto/create-conta-pagar.dto';

@ApiTags('Contas a Pagar')
@ApiBearerAuth()
@Controller('contas-pagar')
export class ContasPagarController {
  constructor(private readonly service: ContasPagarService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova conta a pagar' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateContaPagarDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas a pagar' })
  @ApiResponse({ status: 200, description: 'Lista de contas a pagar' })
  async findAll(@Query() query: QueryContaPagarDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta a pagar por ID' })
  @ApiResponse({ status: 200, description: 'Dados da conta' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conta a pagar' })
  @ApiResponse({ status: 200, description: 'Conta atualizada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateContaPagarDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/baixa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dar baixa em conta a pagar' })
  @ApiResponse({ status: 200, description: 'Baixa realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Conta já está paga ou cancelada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async darBaixa(@Param('id') id: string, @Body() dto: BaixaContaPagarDto) {
    return this.service.darBaixa(id, dto);
  }

  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar conta a pagar' })
  @ApiResponse({ status: 200, description: 'Conta cancelada' })
  async cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover conta a pagar' })
  @ApiResponse({ status: 200, description: 'Conta removida' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
