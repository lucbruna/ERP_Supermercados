import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContasReceberService } from './contas-receber.service';
import { CreateContaReceberDto, UpdateContaReceberDto, QueryContaReceberDto, ReceberContaDto } from './dto/create-conta-receber.dto';

@ApiTags('Contas a Receber')
@ApiBearerAuth()
@Controller('contas-receber')
export class ContasReceberController {
  constructor(private readonly service: ContasReceberService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova conta a receber' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateContaReceberDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas a receber' })
  @ApiResponse({ status: 200, description: 'Lista de contas a receber' })
  async findAll(@Query() query: QueryContaReceberDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta a receber por ID' })
  @ApiResponse({ status: 200, description: 'Dados da conta' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conta a receber' })
  @ApiResponse({ status: 200, description: 'Conta atualizada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async update(@Param('id') id: string, @Body() dto: UpdateContaReceberDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/receber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar recebimento de conta' })
  @ApiResponse({ status: 200, description: 'Recebimento registrado' })
  @ApiResponse({ status: 400, description: 'Conta já recebida ou cancelada' })
  async receber(@Param('id') id: string, @Body() dto: ReceberContaDto) {
    return this.service.receber(id, dto);
  }

  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar conta a receber' })
  @ApiResponse({ status: 200, description: 'Conta cancelada' })
  async cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover conta a receber' })
  @ApiResponse({ status: 200, description: 'Conta removida' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
