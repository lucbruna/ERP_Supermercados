import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BancosService } from './bancos.service';
import { CreateContaBancariaDto, UpdateContaBancariaDto, MovimentacaoBancariaDto } from './dto/create-conta-bancaria.dto';

@ApiTags('Contas Bancárias')
@ApiBearerAuth()
@Controller('bancos')
export class BancosController {
  constructor(private readonly service: BancosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar nova conta bancária' })
  @ApiResponse({ status: 201, description: 'Conta bancária criada' })
  async create(@Body() dto: CreateContaBancariaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas bancárias' })
  async findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta bancária por ID' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conta bancária' })
  async update(@Param('id') id: string, @Body() dto: UpdateContaBancariaDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/movimentar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar movimentação bancária' })
  @ApiResponse({ status: 400, description: 'Conta inativa' })
  async movimentar(@Param('id') id: string, @Body() dto: MovimentacaoBancariaDto) {
    return this.service.movimentar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar conta bancária' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
