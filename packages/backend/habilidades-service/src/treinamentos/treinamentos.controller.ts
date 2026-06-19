import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TreinamentosService } from './treinamentos.service';
import {
  CreateTreinamentoDto, UpdateTreinamentoDto, TreinamentoQueryDto,
  CreateTurmaDto, UpdateTurmaDto, InscreverFuncionarioDto, RegistrarPresencaDto,
} from './dto/treinamentos.dto';

@ApiTags('Treinamentos')
@ApiBearerAuth()
@Controller()
export class TreinamentosController {
  constructor(private readonly treinamentosService: TreinamentosService) {}

  @Post('treinamentos')
  @ApiOperation({ summary: 'Criar treinamento' })
  async create(@Body() dto: CreateTreinamentoDto) {
    return this.treinamentosService.create(dto);
  }

  @Get('treinamentos')
  @ApiOperation({ summary: 'Listar treinamentos' })
  async findAll(@Query() query: TreinamentoQueryDto) {
    return this.treinamentosService.findAll(query);
  }

  @Get('treinamentos/relatorio')
  @ApiOperation({ summary: 'Relatório de treinamentos' })
  async relatorio() {
    return this.treinamentosService.relatorio();
  }

  @Get('treinamentos/:id')
  @ApiOperation({ summary: 'Obter treinamento por ID' })
  async findOne(@Param('id') id: string) {
    return this.treinamentosService.findOne(id);
  }

  @Patch('treinamentos/:id')
  @ApiOperation({ summary: 'Atualizar treinamento' })
  async update(@Param('id') id: string, @Body() dto: UpdateTreinamentoDto) {
    return this.treinamentosService.update(id, dto);
  }

  @Delete('treinamentos/:id')
  @ApiOperation({ summary: 'Remover treinamento' })
  async remove(@Param('id') id: string) {
    return this.treinamentosService.remove(id);
  }

  @Post('treinamentos/:id/criar-turma')
  @ApiOperation({ summary: 'Criar turma para treinamento' })
  async criarTurma(@Param('id') id: string, @Body() dto: CreateTurmaDto) {
    return this.treinamentosService.criarTurma(id, dto);
  }

  @Get('treinamentos/:id/turmas')
  @ApiOperation({ summary: 'Listar turmas de um treinamento' })
  async listarTurmas(@Param('id') id: string) {
    return this.treinamentosService.listarTurmas(id);
  }

  @Get('turmas/:id')
  @ApiOperation({ summary: 'Obter turma por ID' })
  async findTurma(@Param('id') id: string) {
    return this.treinamentosService.findTurma(id);
  }

  @Patch('turmas/:id')
  @ApiOperation({ summary: 'Atualizar turma' })
  async updateTurma(@Param('id') id: string, @Body() dto: UpdateTurmaDto) {
    return this.treinamentosService.updateTurma(id, dto);
  }

  @Post('turmas/:id/inscrever')
  @ApiOperation({ summary: 'Inscrever funcionário em turma' })
  async inscrever(@Param('id') id: string, @Body() dto: InscreverFuncionarioDto) {
    return this.treinamentosService.inscrever(id, dto);
  }

  @Post('turmas/:id/registrar-presenca')
  @ApiOperation({ summary: 'Registrar presença de funcionário' })
  async registrarPresenca(@Param('id') id: string, @Body() dto: RegistrarPresencaDto) {
    return this.treinamentosService.registrarPresenca(id, dto);
  }

  @Post('turmas/:id/concluir')
  @ApiOperation({ summary: 'Concluir turma e aprovar participantes com frequência >= 75%' })
  async concluirTurma(@Param('id') id: string) {
    return this.treinamentosService.concluirTurma(id);
  }
}
