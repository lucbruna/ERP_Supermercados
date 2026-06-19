import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { QueryAvaliacaoDto } from './dto/query-avaliacao.dto';

@ApiTags('Avaliações de Fornecedores')
@ApiBearerAuth()
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly service: AvaliacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar avaliação de fornecedor' })
  @ApiResponse({ status: 201, description: 'Avaliação criada.' })
  create(@Body() dto: CreateAvaliacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar avaliações (paginado)' })
  findAll(@Query() query: QueryAvaliacaoDto) {
    return this.service.findAll(query);
  }

  @Get('fornecedor/:fornecedorId')
  @ApiOperation({ summary: 'Listar avaliações por fornecedor' })
  findByFornecedor(@Param('fornecedorId') fornecedorId: string) {
    return this.service.findByFornecedor(fornecedorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter avaliação por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
