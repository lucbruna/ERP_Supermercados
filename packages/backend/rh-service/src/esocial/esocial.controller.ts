import {
  Controller, Get, Post, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { EsocialService } from './esocial.service';
import {
  AdmissaoData, AlteracaoData, FeriasData,
  AfastamentoData, RescisaoData, ConsultaEventosDto,
  EventoDto, LoteEventosDto,
} from './esocial.dto';

@ApiTags('eSocial')
@Controller('esocial')
export class EsocialController {
  constructor(private readonly esocialService: EsocialService) {}

  @Post('admissao')
  @ApiOperation({ summary: 'Gerar e enviar evento S-2200 (Admissão de Trabalhador)' })
  async admissao(@Body() dados: AdmissaoData) {
    const evento = await this.esocialService.gerarEventoS2200(dados);
    const lote = await this.esocialService.gerarLote([evento]);
    return this.esocialService.enviarLote(lote);
  }

  @Post('alteracao')
  @ApiOperation({ summary: 'Gerar e enviar evento S-2206 (Alteração de Dados Contratuais)' })
  async alteracao(@Body() dados: AlteracaoData) {
    const evento = await this.esocialService.gerarEventoS2206(dados);
    const lote = await this.esocialService.gerarLote([evento]);
    return this.esocialService.enviarLote(lote);
  }

  @Post('ferias')
  @ApiOperation({ summary: 'Gerar e enviar evento S-2230 (Férias)' })
  async ferias(@Body() dados: FeriasData) {
    const evento = await this.esocialService.gerarEventoS2230(dados);
    const lote = await this.esocialService.gerarLote([evento]);
    return this.esocialService.enviarLote(lote);
  }

  @Post('afastamento')
  @ApiOperation({ summary: 'Gerar e enviar evento S-2250 (Afastamento Temporário)' })
  async afastamento(@Body() dados: AfastamentoData) {
    const evento = await this.esocialService.gerarEventoS2250(dados);
    const lote = await this.esocialService.gerarLote([evento]);
    return this.esocialService.enviarLote(lote);
  }

  @Post('rescisao')
  @ApiOperation({ summary: 'Gerar e enviar evento S-2299 (Desligamento)' })
  async rescisao(@Body() dados: RescisaoData) {
    const evento = await this.esocialService.gerarEventoS2299(dados);
    const lote = await this.esocialService.gerarLote([evento]);
    return this.esocialService.enviarLote(lote);
  }

  @Get('eventos')
  @ApiOperation({ summary: 'Listar eventos enviados' })
  async listarEventos(@Query() query: ConsultaEventosDto) {
    return this.esocialService.listarEventos(query.funcionarioId, query.periodo, query.tipo);
  }

  @Get('eventos/:id/recibo')
  @ApiOperation({ summary: 'Obter recibo de processamento' })
  async obterRecibo(@Param('id') id: string) {
    return this.esocialService.obterRecibo(id);
  }

  @Post('lote')
  @ApiOperation({ summary: 'Enviar lote de eventos (máx. 50)' })
  @ApiBody({ type: LoteEventosDto })
  async enviarLote(@Body() body: { eventos: EventoDto[] }) {
    const lote = await this.esocialService.gerarLote(body.eventos);
    return this.esocialService.enviarLote(lote);
  }

  @Get('recibo/:protocolo')
  @ApiOperation({ summary: 'Consultar recibo de processamento por protocolo' })
  async consultarRecibo(@Param('protocolo') protocolo: string) {
    return this.esocialService.consultarRecibo(protocolo);
  }
}
