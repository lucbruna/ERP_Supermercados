import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PixService } from './pix.service';
import { CreatePixDto, UpdatePixDto, QueryPixDto } from './dto/pix.dto';

@ApiTags('PIX')
@ApiBearerAuth()
@Controller('pix')
export class PixController {
  constructor(private readonly service: PixService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nova transação PIX' })
  async create(@Body() dto: CreatePixDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações PIX' })
  async findAll(@Query() query: QueryPixDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter transação PIX por ID' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar transação PIX' })
  async update(@Param('id') id: string, @Body() dto: UpdatePixDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/confirmar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar transação PIX' })
  async confirmar(@Param('id') id: string) {
    return this.service.confirmar(id);
  }

  @Post(':id/estornar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estornar transação PIX' })
  async estornar(@Param('id') id: string) {
    return this.service.estornar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover transação PIX' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
