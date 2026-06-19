import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficioDto, UpdateBeneficioDto, BeneficioQueryDto, VincularBeneficioDto } from './dto/create-beneficio.dto';

@ApiTags('Benefícios')
@ApiBearerAuth()
@Controller()
export class BeneficioController {
  constructor(private readonly beneficioService: BeneficioService) {}

  @Post('beneficios')
  @ApiOperation({ summary: 'Criar benefício' })
  async create(@Body() dto: CreateBeneficioDto) {
    return this.beneficioService.create(dto);
  }

  @Get('beneficios')
  @ApiOperation({ summary: 'Listar benefícios' })
  async findAll(
    @Query('companyId') companyId: string,
    @Query() query: BeneficioQueryDto,
  ) {
    return this.beneficioService.findAll(companyId, query);
  }

  @Get('beneficios/:id')
  @ApiOperation({ summary: 'Obter benefício por ID' })
  async findOne(@Param('id') id: string) {
    return this.beneficioService.findOne(id);
  }

  @Patch('beneficios/:id')
  @ApiOperation({ summary: 'Atualizar benefício' })
  async update(@Param('id') id: string, @Body() dto: UpdateBeneficioDto) {
    return this.beneficioService.update(id, dto);
  }

  @Delete('beneficios/:id')
  @ApiOperation({ summary: 'Remover benefício' })
  async remove(@Param('id') id: string) {
    return this.beneficioService.remove(id);
  }

  @Patch('beneficios/:id/toggle')
  @ApiOperation({ summary: 'Ativar/Desativar benefício' })
  async toggleAtivo(@Param('id') id: string) {
    return this.beneficioService.toggleAtivo(id);
  }

  @Post('beneficios/vincular')
  @ApiOperation({ summary: 'Vincular benefício a funcionário' })
  async vincular(@Body() dto: VincularBeneficioDto) {
    return this.beneficioService.vincular(dto);
  }

  @Delete('beneficios/vincular/:funcionarioId/:beneficioId')
  @ApiOperation({ summary: 'Desvincular benefício de funcionário' })
  async desvincular(
    @Param('funcionarioId') funcionarioId: string,
    @Param('beneficioId') beneficioId: string,
  ) {
    return this.beneficioService.desvincular(funcionarioId, beneficioId);
  }

  @Get('funcionarios/:funcionarioId/beneficios')
  @ApiOperation({ summary: 'Listar benefícios de um funcionário' })
  async listarPorFuncionario(@Param('funcionarioId') funcionarioId: string) {
    return this.beneficioService.listarPorFuncionario(funcionarioId);
  }
}
