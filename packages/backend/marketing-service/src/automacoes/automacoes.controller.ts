import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomacoesService } from './automacoes.service';
import { CreateAutomacaoDto, UpdateAutomacaoDto, AutomacaoQueryDto } from './dto/create-automacao.dto';

@ApiTags('Regras de Automação')
@ApiBearerAuth()
@Controller('automacoes')
export class AutomacoesController {
  constructor(private readonly automacoesService: AutomacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar regra de automação' })
  async create(@Body() dto: CreateAutomacaoDto) {
    return this.automacoesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar automações' })
  async findAll(@Query() query: AutomacaoQueryDto) {
    const companyId = (query as any)['companyId'] || process.env.DEFAULT_COMPANY_ID;
    return this.automacoesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter automação por ID' })
  async findOne(@Param('id') id: string) {
    return this.automacoesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar automação' })
  async update(@Param('id') id: string, @Body() dto: UpdateAutomacaoDto) {
    return this.automacoesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover automação' })
  async remove(@Param('id') id: string) {
    return this.automacoesService.remove(id);
  }

  @Post(':id/ativar')
  @ApiOperation({ summary: 'Ativar automação' })
  async ativar(@Param('id') id: string) {
    return this.automacoesService.ativar(id);
  }

  @Post(':id/desativar')
  @ApiOperation({ summary: 'Desativar automação' })
  async desativar(@Param('id') id: string) {
    return this.automacoesService.desativar(id);
  }

  @Post('processar/:gatilho')
  @ApiOperation({ summary: 'Processar automações por gatilho' })
  async processar(@Param('gatilho') gatilho: string, @Body() dados: any) {
    return this.automacoesService.processar(gatilho, dados);
  }
}
