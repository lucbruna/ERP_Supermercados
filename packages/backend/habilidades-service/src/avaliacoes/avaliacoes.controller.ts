import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvaliacoesService } from './avaliacoes.service';
import {
  CreateAvaliacaoDto, AvaliacaoQueryDto, ResponderAvaliacaoDto,
} from './dto/avaliacoes.dto';

@ApiTags('Avaliações de Competência')
@ApiBearerAuth()
@Controller()
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post('avaliacoes')
  @ApiOperation({ summary: 'Criar avaliação de competência' })
  async create(@Body() dto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(dto);
  }

  @Get('avaliacoes')
  @ApiOperation({ summary: 'Listar avaliações' })
  async findAll(@Query() query: AvaliacaoQueryDto) {
    return this.avaliacoesService.findAll(query);
  }

  @Get('avaliacoes/:id')
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  async findOne(@Param('id') id: string) {
    return this.avaliacoesService.findOne(id);
  }

  @Post('avaliacoes/:id/responder')
  @ApiOperation({ summary: 'Responder avaliação' })
  async responder(@Param('id') id: string, @Body() dto: ResponderAvaliacaoDto) {
    return this.avaliacoesService.responder(id, dto);
  }

  @Get('avaliacoes/relatorio/funcionario/:id')
  @ApiOperation({ summary: 'Relatório completo de competências do funcionário' })
  async relatorioFuncionario(@Param('id') id: string) {
    return this.avaliacoesService.relatorioFuncionario(id);
  }
}
