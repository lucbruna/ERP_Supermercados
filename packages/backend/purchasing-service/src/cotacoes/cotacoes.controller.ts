import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CotacoesService } from './cotacoes.service';
import { CreateCotacaoDto } from './dto/create-cotacao.dto';
import { UpdateCotacaoDto } from './dto/update-cotacao.dto';
import { QueryCotacaoDto } from './dto/query-cotacao.dto';
import { SelecionarVencedorDto } from './dto/selecionar-vencedor.dto';

@ApiTags('Cotações')
@ApiBearerAuth()
@Controller('cotacoes')
export class CotacoesController {
  constructor(private readonly service: CotacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cotação' })
  @ApiResponse({ status: 201, description: 'Cotação criada.' })
  create(@Body() dto: CreateCotacaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cotações (paginado)' })
  findAll(@Query() query: QueryCotacaoDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cotação por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cotação' })
  update(@Param('id') id: string, @Body() dto: UpdateCotacaoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/abrir')
  @ApiOperation({ summary: 'Abrir cotação' })
  abrir(@Param('id') id: string) {
    return this.service.abrir(id);
  }

  @Post(':id/fechar')
  @ApiOperation({ summary: 'Fechar cotação' })
  fechar(@Param('id') id: string) {
    return this.service.fechar(id);
  }

  @Post(':id/selecionar-vencedor')
  @ApiOperation({ summary: 'Selecionar vencedor da cotação' })
  selecionarVencedor(@Param('id') id: string, @Body() dto: SelecionarVencedorDto) {
    return this.service.selecionarVencedor(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar cotação' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
