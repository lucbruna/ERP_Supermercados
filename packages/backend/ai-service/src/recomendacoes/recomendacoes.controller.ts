import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RecomendacoesService } from './recomendacoes.service';
import { GerarRecomendacaoDto, RecomendacaoQueryDto, CreateRecomendacaoDto } from '../dto/recomendacao.dto';

@ApiTags('recomendacoes')
@Controller('recomendacoes')
export class RecomendacoesController {
  constructor(private readonly service: RecomendacoesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate recommendations' })
  @ApiBody({ type: GerarRecomendacaoDto })
  generate(@Body() dto: GerarRecomendacaoDto) {
    return this.service.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all recommendations' })
  findAll(@Query() query: RecomendacaoQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recommendation by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recommendation manually' })
  @ApiBody({ type: CreateRecomendacaoDto })
  create(@Body() dto: CreateRecomendacaoDto) {
    return this.service.create(dto);
  }

  @Patch(':id/processed')
  @ApiOperation({ summary: 'Mark recommendation as processed' })
  markProcessed(@Param('id') id: string) {
    return this.service.markProcessed(id);
  }
}
