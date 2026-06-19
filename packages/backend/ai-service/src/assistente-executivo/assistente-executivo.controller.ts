import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssistenteExecutivoService } from './assistente-executivo.service';
import { PerguntaDto, AnaliseSentimentoDto, SugestaoAcaoDto } from './assistente-executivo.dto';

@ApiTags('assistente-executivo')
@Controller('assistente')
export class AssistenteExecutivoController {
  constructor(private readonly service: AssistenteExecutivoService) {}

  @Post('perguntar')
  @ApiOperation({ summary: 'Fazer perguntas em linguagem natural sobre o negócio' })
  async perguntar(@Body() dto: PerguntaDto) {
    const data = await this.service.perguntar(dto);
    return { success: true, data };
  }

  @Post('resumo-diario')
  @ApiOperation({ summary: 'Obter resumo diário com eventos, prioridades e alertas' })
  async gerarResumoDiario() {
    const data = await this.service.gerarResumoDiario();
    return { success: true, data };
  }

  @Get('sugestoes')
  @ApiOperation({ summary: 'Obter sugestões proativas baseadas no contexto atual' })
  async sugerirAcao() {
    const data = await this.service.sugerirAcao();
    return { success: true, data };
  }
}
