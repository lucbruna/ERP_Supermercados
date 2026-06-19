import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HabilidadesService } from './habilidades.service';
import {
  CreateHabilidadeDto, UpdateHabilidadeDto, HabilidadeQueryDto,
  VincularHabilidadeDto, AtualizarNivelHabilidadeDto,
} from './dto/habilidades.dto';

@ApiTags('Habilidades')
@ApiBearerAuth()
@Controller()
export class HabilidadesController {
  constructor(private readonly habilidadesService: HabilidadesService) {}

  @Post('habilidades')
  @ApiOperation({ summary: 'Criar habilidade' })
  async create(@Body() dto: CreateHabilidadeDto) {
    return this.habilidadesService.create(dto);
  }

  @Get('habilidades')
  @ApiOperation({ summary: 'Listar habilidades' })
  async findAll(@Query() query: HabilidadeQueryDto) {
    return this.habilidadesService.findAll(query);
  }

  @Get('habilidades/:id')
  @ApiOperation({ summary: 'Obter habilidade por ID' })
  async findOne(@Param('id') id: string) {
    return this.habilidadesService.findOne(id);
  }

  @Patch('habilidades/:id')
  @ApiOperation({ summary: 'Atualizar habilidade' })
  async update(@Param('id') id: string, @Body() dto: UpdateHabilidadeDto) {
    return this.habilidadesService.update(id, dto);
  }

  @Delete('habilidades/:id')
  @ApiOperation({ summary: 'Remover habilidade' })
  async remove(@Param('id') id: string) {
    return this.habilidadesService.remove(id);
  }

  @Post('habilidades/:id/vincular-funcionario')
  @ApiOperation({ summary: 'Vincular habilidade a funcionário' })
  async vincularFuncionario(@Param('id') id: string, @Body() dto: VincularHabilidadeDto) {
    return this.habilidadesService.vincularFuncionario(id, dto);
  }

  @Patch('habilidades/:id/vincular-funcionario/:funcionarioId')
  @ApiOperation({ summary: 'Atualizar nível de habilidade do funcionário' })
  async atualizarNivel(
    @Param('id') id: string,
    @Param('funcionarioId') funcionarioId: string,
    @Body() dto: AtualizarNivelHabilidadeDto,
  ) {
    return this.habilidadesService.atualizarNivel(id, funcionarioId, dto);
  }

  @Delete('habilidades/:id/desvincular-funcionario/:funcionarioId')
  @ApiOperation({ summary: 'Desvincular habilidade de funcionário' })
  async desvincularFuncionario(
    @Param('id') id: string,
    @Param('funcionarioId') funcionarioId: string,
  ) {
    return this.habilidadesService.desvincularFuncionario(id, funcionarioId);
  }
}
