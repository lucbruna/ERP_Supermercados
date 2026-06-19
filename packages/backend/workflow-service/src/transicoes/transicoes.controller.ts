import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransicoesService } from './transicoes.service';
import { CreateTransicaoDto, UpdateTransicaoDto } from './dto/transicao.dto';

@ApiTags('transicoes')
@Controller()
export class TransicoesController {
  constructor(private readonly service: TransicoesService) {}

  @Post('workflows/:workflowId/transicoes')
  @ApiOperation({ summary: 'Add transition to workflow' })
  create(@Param('workflowId') workflowId: string, @Body() dto: CreateTransicaoDto) {
    return this.service.create(workflowId, dto);
  }

  @Get('workflows/:workflowId/transicoes')
  @ApiOperation({ summary: 'List transitions for workflow' })
  findAll(@Param('workflowId') workflowId: string) {
    return this.service.findAll(workflowId);
  }

  @Get('transicoes/:id')
  @ApiOperation({ summary: 'Get transition by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('transicoes/:id')
  @ApiOperation({ summary: 'Update transition' })
  update(@Param('id') id: string, @Body() dto: UpdateTransicaoDto) {
    return this.service.update(id, dto);
  }

  @Delete('transicoes/:id')
  @ApiOperation({ summary: 'Delete transition' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('transicoes/disponiveis/:instanciaId')
  @ApiOperation({ summary: 'Get available transitions for current instance state' })
  getDisponiveis(@Param('instanciaId') instanciaId: string) {
    return this.service.getDisponiveis(instanciaId);
  }
}
