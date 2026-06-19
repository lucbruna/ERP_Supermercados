import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  AdmissaoData, AlteracaoData, FeriasData, CondicaoAmbienteData,
  AposentadoriaData, AfastamentoData, ReintegracaoData, RescisaoData,
  DesligamentoTSVData, EventoDto,
} from './esocial.dto';
import {
  buildS2200XML, buildS2206XML, buildS2230XML, buildS2240XML,
  buildS2241XML, buildS2250XML, buildS2298XML, buildS2299XML, buildS2399XML,
} from './xml-templates';

@Injectable()
export class EsocialService {
  private readonly logger = new Logger(EsocialService.name);
  private eventos: Map<string, EventoDto> = new Map();
  private protocolos: Map<string, any> = new Map();
  private readonly MAX_LOTE = 50;
  private readonly TIPOS_EVENTO: Record<string, string> = {
    S2200: 'Admissão',
    S2206: 'Alteração Contratual',
    S2230: 'Férias',
    S2240: 'Condições Ambientais',
    S2241: 'Insalubridade/Periculosidade',
    S2250: 'Afastamento Temporário',
    S2298: 'Reintegração',
    S2299: 'Desligamento',
    S2399: 'Desligamento TSV',
  };

  private gerarEventoId(tipo: string, cpf: string, data: string): string {
    const sequencial = Date.now().toString().slice(-5);
    const dataStr = data.replace(/\D/g, '');
    return `ID1${cpf}${tipo}${dataStr}${sequencial}`;
  }

  private calcularHash(xml: string): string {
    return createHash('sha256').update(xml, 'utf8').digest('hex');
  }

  async gerarEventoS2200(dados: AdmissaoData): Promise<EventoDto> {
    const xml = buildS2200XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2200', dados.cpf, dados.dataAdmissao);
    const evento: EventoDto = { id, tipo: 'S2200', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2200 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2206(dados: AlteracaoData): Promise<EventoDto> {
    const xml = buildS2206XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2206', dados.cpf, dados.dataAlteracao);
    const evento: EventoDto = { id, tipo: 'S2206', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2206 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2230(dados: FeriasData): Promise<EventoDto> {
    const xml = buildS2230XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2230', dados.cpf, dados.dataInicio);
    const evento: EventoDto = { id, tipo: 'S2230', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2230 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2240(dados: CondicaoAmbienteData): Promise<EventoDto> {
    const xml = buildS2240XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2240', dados.cpf, dados.dataInicio);
    const evento: EventoDto = { id, tipo: 'S2240', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2240 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2241(dados: AposentadoriaData): Promise<EventoDto> {
    const xml = buildS2241XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2241', dados.cpf, dados.dataInicio);
    const evento: EventoDto = { id, tipo: 'S2241', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2241 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2250(dados: AfastamentoData): Promise<EventoDto> {
    const xml = buildS2250XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2250', dados.cpf, dados.dataInicio);
    const evento: EventoDto = { id, tipo: 'S2250', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2250 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2298(dados: ReintegracaoData): Promise<EventoDto> {
    const xml = buildS2298XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2298', dados.cpf, dados.dataReintegracao);
    const evento: EventoDto = { id, tipo: 'S2298', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2298 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2299(dados: RescisaoData): Promise<EventoDto> {
    const xml = buildS2299XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2299', dados.cpf, dados.dataDesligamento);
    const evento: EventoDto = { id, tipo: 'S2299', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2299 gerado: ${id}`);
    return evento;
  }

  async gerarEventoS2399(dados: DesligamentoTSVData): Promise<EventoDto> {
    const xml = buildS2399XML(dados);
    const hash = this.calcularHash(xml);
    const id = this.gerarEventoId('2399', dados.cpf, dados.dataDesligamento);
    const evento: EventoDto = { id, tipo: 'S2399', cpf: dados.cpf, xml, hash, status: 'GERADO', dataCriacao: new Date() };
    this.eventos.set(id, evento);
    this.logger.log(`S-2399 gerado: ${id}`);
    return evento;
  }

  async gerarLote(eventos: EventoDto[]): Promise<EventoDto[]> {
    if (eventos.length > this.MAX_LOTE) {
      throw new BadRequestException(`Lote excede o máximo de ${this.MAX_LOTE} eventos`);
    }
    return eventos.map(e => ({ ...e, status: 'NO_LOTE' }));
  }

  async enviarLote(lote: EventoDto[]): Promise<any> {
    const protocolo = `PROTO${Date.now()}${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const recibo = `REC${Date.now()}${Math.random().toString(36).slice(-4).toUpperCase()}`;
    const resultado = lote.map(e => ({
      ...e,
      status: 'ENVIADO',
      protocolo,
      recibo: `${recibo}-${e.tipo}`,
      dataEnvio: new Date(),
    }));
    resultado.forEach(e => this.eventos.set(e.id, e));
    this.protocolos.set(protocolo, { protocolo, eventos: resultado, dataEnvio: new Date(), status: 'PROCESSANDO' });
    this.logger.log(`Lote enviado: ${protocolo} (${lote.length} eventos)`);
    return { success: true, data: { protocolo, eventos: resultado } };
  }

  async consultarRecibo(protocolo: string): Promise<any> {
    const lote = this.protocolos.get(protocolo);
    if (!lote) {
      const simulado = {
        protocolo,
        status: 'PROCESSADO',
        eventos: [],
        dataProcessamento: new Date().toISOString(),
        observacao: 'Protocolo não encontrado localmente (simulado)',
      };
      return { success: true, data: simulado };
    }
    const processado = {
      ...lote,
      status: 'PROCESSADO',
      dataProcessamento: new Date().toISOString(),
    };
    this.protocolos.set(protocolo, processado);
    return { success: true, data: processado };
  }

  async listarEventos(funcionarioId?: string, periodo?: string, tipo?: string): Promise<any> {
    let eventos = Array.from(this.eventos.values());
    if (tipo) eventos = eventos.filter(e => e.tipo === tipo);
    if (periodo) {
      const [ano, mes] = periodo.split('-').map(Number);
      eventos = eventos.filter(e => {
        const d = new Date(e.dataCriacao);
        return d.getFullYear() === ano && d.getMonth() + 1 === mes;
      });
    }
    eventos.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
    return { success: true, data: eventos };
  }

  async obterRecibo(id: string): Promise<any> {
    const evento = this.eventos.get(id);
    if (!evento) throw new BadRequestException('Evento não encontrado');
    return {
      success: true,
      data: {
        id: evento.id,
        tipo: evento.tipo,
        status: evento.status,
        protocolo: evento.protocolo,
        recibo: evento.recibo,
        descricao: this.TIPOS_EVENTO[evento.tipo] || evento.tipo,
      },
    };
  }
}
