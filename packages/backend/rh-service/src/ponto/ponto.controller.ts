import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PontoService } from './ponto.service';
import {
  CreateRegistroPontoDto, UpdateRegistroPontoDto, PontoQueryDto,
  PontoRelatorioDto, PontoBiometricoDto,
} from './dto/create-ponto.dto';

@ApiTags('Registro de Ponto')
@ApiBearerAuth()
@Controller('ponto')
export class PontoController {
  constructor(private readonly pontoService: PontoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar ponto (entrada/saída/intervalo)' })
  async create(@Body() dto: CreateRegistroPontoDto) {
    return this.pontoService.create(dto);
  }

  @Post('biometrico')
  @ApiOperation({ summary: 'Registrar ponto com autenticação biométrica (digital + face)' })
  async registrarComBiometria(@Body() dto: PontoBiometricoDto) {
    return this.pontoService.registrarComBiometria(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de ponto' })
  @ApiQuery({ name: 'funcionarioId', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'origem', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: PontoQueryDto) {
    return this.pontoService.findAll(query);
  }

  @Get('current/:funcionarioId')
  @ApiOperation({ summary: 'Obter status atual do ponto (clock in/out)' })
  async findCurrent(@Param('funcionarioId') funcionarioId: string) {
    return this.pontoService.findCurrent(funcionarioId);
  }

  @Get('today/:funcionarioId')
  @ApiOperation({ summary: 'Registros de ponto de hoje' })
  async findToday(@Param('funcionarioId') funcionarioId: string) {
    return this.pontoService.findToday(funcionarioId);
  }

  @Get('dashboard/:funcionarioId')
  @ApiOperation({ summary: 'Dashboard completo do ponto (hoje, mês, biometrias)' })
  async dashboard(@Param('funcionarioId') funcionarioId: string) {
    return this.pontoService.dashboard(funcionarioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter registro de ponto por ID' })
  async findOne(@Param('id') id: string) {
    return this.pontoService.findOne(id);
  }

  @Post('relatorio')
  @ApiOperation({ summary: 'Gerar relatório mensal de ponto' })
  async generateRelatorio(@Body() dto: PontoRelatorioDto) {
    return this.pontoService.generateRelatorio(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro de ponto' })
  async update(@Param('id') id: string, @Body() dto: UpdateRegistroPontoDto) {
    return this.pontoService.update(id, dto);
  }

  @Patch(':id/validar')
  @ApiOperation({ summary: 'Validar registro de ponto' })
  async validar(@Param('id') id: string) {
    return this.pontoService.validar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover registro de ponto' })
  async remove(@Param('id') id: string) {
    return this.pontoService.remove(id);
  }
}
