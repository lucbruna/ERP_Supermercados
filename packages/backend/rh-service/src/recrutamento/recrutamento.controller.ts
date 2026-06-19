import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecrutamentoService } from './recrutamento.service';
import {
  CreateRecrutamentoDto, UpdateRecrutamentoDto, RecrutamentoQueryDto,
  CreateCandidatoDto, UpdateCandidatoDto,
} from './dto/create-recrutamento.dto';

@ApiTags('Recrutamento e Seleção')
@ApiBearerAuth()
@Controller()
export class RecrutamentoController {
  constructor(private readonly recrutamentoService: RecrutamentoService) {}

  @Post('recrutamentos')
  @ApiOperation({ summary: 'Criar vaga de recrutamento' })
  async createRecrutamento(@Body() dto: CreateRecrutamentoDto) {
    return this.recrutamentoService.createRecrutamento(dto);
  }

  @Get('recrutamentos')
  @ApiOperation({ summary: 'Listar vagas de recrutamento' })
  async findAllRecrutamentos(@Query() query: RecrutamentoQueryDto) {
    return this.recrutamentoService.findAllRecrutamentos(query);
  }

  @Get('recrutamentos/:id')
  @ApiOperation({ summary: 'Obter vaga de recrutamento por ID' })
  async findOneRecrutamento(@Param('id') id: string) {
    return this.recrutamentoService.findOneRecrutamento(id);
  }

  @Patch('recrutamentos/:id')
  @ApiOperation({ summary: 'Atualizar vaga de recrutamento' })
  async updateRecrutamento(@Param('id') id: string, @Body() dto: UpdateRecrutamentoDto) {
    return this.recrutamentoService.updateRecrutamento(id, dto);
  }

  @Patch('recrutamentos/:id/fechar')
  @ApiOperation({ summary: 'Fechar vaga de recrutamento' })
  async fecharRecrutamento(@Param('id') id: string) {
    return this.recrutamentoService.fecharRecrutamento(id);
  }

  @Delete('recrutamentos/:id')
  @ApiOperation({ summary: 'Remover vaga de recrutamento' })
  async removeRecrutamento(@Param('id') id: string) {
    return this.recrutamentoService.removeRecrutamento(id);
  }

  @Post('candidatos')
  @ApiOperation({ summary: 'Cadastrar candidato em vaga' })
  async createCandidato(@Body() dto: CreateCandidatoDto) {
    return this.recrutamentoService.createCandidato(dto);
  }

  @Get('recrutamentos/:recrutamentoId/candidatos')
  @ApiOperation({ summary: 'Listar candidatos de uma vaga' })
  async findAllCandidatos(
    @Param('recrutamentoId') recrutamentoId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.recrutamentoService.findAllCandidatos(recrutamentoId, { page, limit });
  }

  @Get('candidatos/:id')
  @ApiOperation({ summary: 'Obter candidato por ID' })
  async findOneCandidato(@Param('id') id: string) {
    return this.recrutamentoService.findOneCandidato(id);
  }

  @Patch('candidatos/:id')
  @ApiOperation({ summary: 'Atualizar candidato' })
  async updateCandidato(@Param('id') id: string, @Body() dto: UpdateCandidatoDto) {
    return this.recrutamentoService.updateCandidato(id, dto);
  }

  @Post('candidatos/:id/etapa')
  @ApiOperation({ summary: 'Avançar etapa do candidato' })
  async avancarEtapaCandidato(@Param('id') id: string, @Body('etapa') etapa: string) {
    return this.recrutamentoService.avancarEtapaCandidato(id, etapa);
  }

  @Delete('candidatos/:id')
  @ApiOperation({ summary: 'Remover candidato' })
  async removeCandidato(@Param('id') id: string) {
    return this.recrutamentoService.removeCandidato(id);
  }
}
