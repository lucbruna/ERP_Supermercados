import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RatesCache } from './rates-cache';
import {
  CalcularFreteDto, FreteResponseDto, RastreioResponseDto, EventoRastreioDto,
  CEPResponseDto, ColetaData, ColetaResponseDto, ServicoCorreios,
} from './correios.dto';
import * as https from 'https';

const SERVICOS_NOMES: Record<string, string> = {
  '04014': 'SEDEX',
  '04790': 'SEDEX 10',
  '04782': 'SEDEX 12',
  '04065': 'SEDEX Hoje',
  '04510': 'PAC',
  '04804': 'PAC Hoje',
};

const TAXAS_SIMULADAS: Record<string, { taxaFixa: number; taxaKg: number; prazoBase: number; prazoPorKm: number }> = {
  '04014': { taxaFixa: 15.0, taxaKg: 3.5, prazoBase: 2, prazoPorKm: 0.005 },
  '04790': { taxaFixa: 35.0, taxaKg: 5.0, prazoBase: 1, prazoPorKm: 0.003 },
  '04782': { taxaFixa: 25.0, taxaKg: 4.0, prazoBase: 1, prazoPorKm: 0.004 },
  '04065': { taxaFixa: 40.0, taxaKg: 6.0, prazoBase: 0, prazoPorKm: 0.002 },
  '04510': { taxaFixa: 10.0, taxaKg: 2.5, prazoBase: 5, prazoPorKm: 0.008 },
  '04804': { taxaFixa: 20.0, taxaKg: 3.0, prazoBase: 3, prazoPorKm: 0.006 },
};

@Injectable()
export class CorreiosService {
  private readonly logger = new Logger(CorreiosService.name);
  private readonly correiosUser: string;
  private readonly correiosPass: string;
  private readonly correiosToken: string;
  private readonly viaCepUrl = 'https://viacep.com.br/ws';
  private readonly rastroUrl = 'https://api.correios.com.br/rastro/v1/rastros';

  constructor(
    private readonly ratesCache: RatesCache,
    private readonly httpService: HttpService,
  ) {
    this.correiosUser = process.env.CORREIOS_USER || '';
    this.correiosPass = process.env.CORREIOS_PASS || '';
    this.correiosToken = process.env.CORREIOS_TOKEN || '';
  }

  private get modoSimulado(): boolean {
    return !this.correiosUser || !this.correiosPass;
  }

  private calcularDistanciaKm(cep1: string, cep2: string): number {
    const p1 = parseInt(cep1.slice(0, 5), 10);
    const p2 = parseInt(cep2.slice(0, 5), 10);
    return Math.abs(p2 - p1) * 1.5;
  }

  private simularFrete(dto: CalcularFreteDto): FreteResponseDto {
    const servico = dto.servico || ServicoCorreios.SEDEX;
    const config = TAXAS_SIMULADAS[servico];
    if (!config) {
      return {
        servico: servico,
        codigo: servico,
        valor: 0,
        prazoDias: 0,
        erro: 'Serviço não encontrado',
      };
    }
    const distancia = this.calcularDistanciaKm(dto.cepOrigem, dto.cepDestino);
    const valor = config.taxaFixa + config.taxaKg * dto.peso + distancia * 0.02;
    const prazo = Math.ceil(config.prazoBase + distancia * config.prazoPorKm);
    return {
      servico: SERVICOS_NOMES[servico] || servico,
      codigo: servico,
      valor: Math.round(valor * 100) / 100,
      prazoDias: Math.max(1, prazo),
      prazoEntrega: `${Math.max(1, prazo)} dia(s) útil(eis)`,
    };
  }

  private async consultarCorreiosSOAP(dto: CalcularFreteDto): Promise<FreteResponseDto> {
    const servico = dto.servico || ServicoCorreios.SEDEX;
    try {
      const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tem:CalcPrecoPrazo>
      <tem:nCdEmpresa>${this.correiosUser}</tem:nCdEmpresa>
      <tem:sDsSenha>${this.correiosPass}</tem:sDsSenha>
      <tem:nCdServico>${servico}</tem:nCdServico>
      <tem:sCepOrigem>${dto.cepOrigem}</tem:sCepOrigem>
      <tem:sCepDestino>${dto.cepDestino}</tem:sCepDestino>
      <tem:nVlPeso>${dto.peso}</tem:nVlPeso>
      <tem:nCdFormato>1</tem:nCdFormato>
      <tem:nVlComprimento>${dto.comprimento}</tem:nVlComprimento>
      <tem:nVlAltura>${dto.altura}</tem:nVlAltura>
      <tem:nVlLargura>${dto.largura}</tem:nVlLargura>
      <tem:nVlDiametro>0</tem:nVlDiametro>
      <tem:sCdMaoPropria>N</tem:sCdMaoPropria>
      <tem:nVlValorDeclarado>0</tem:nVlValorDeclarado>
      <tem:sCdAvisoRecebimento>N</tem:sCdAvisoRecebimento>
    </tem:CalcPrecoPrazo>
  </soapenv:Body>
</soapenv:Envelope>`;

      const response = await firstValueFrom(
        this.httpService.post('https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl', soapBody, {
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          timeout: 15000,
        }),
      );

      const valorMatch = response.data?.match(/<Valor>(.*?)<\/Valor>/);
      const prazoMatch = response.data?.match(/<PrazoEntrega>(.*?)<\/PrazoEntrega>/);
      const erroMatch = response.data?.match(/<Erro>(.*?)<\/Erro>/);

      return {
        servico: SERVICOS_NOMES[servico] || servico,
        codigo: servico,
        valor: valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : 0,
        prazoDias: prazoMatch ? parseInt(prazoMatch[1], 10) : 0,
        erro: erroMatch && erroMatch[1] !== '0' ? `Erro Correios: ${erroMatch[1]}` : undefined,
      };
    } catch (error: any) {
      this.logger.warn(`Falha ao consultar Correios SOAP: ${error.message}. Usando modo simulado.`);
      return this.simularFrete(dto);
    }
  }

  async calcularFrete(dto: CalcularFreteDto): Promise<any> {
    const servico = dto.servico || ServicoCorreios.SEDEX;

    const cached = this.ratesCache.get(dto.cepOrigem, dto.cepDestino, servico, dto.peso);
    if (cached) {
      return {
        success: true,
        data: {
          servico: SERVICOS_NOMES[servico] || servico,
          codigo: servico,
          valor: cached.valor,
          prazoDias: cached.prazo,
          prazoEntrega: `${cached.prazo} dia(s) útil(eis)`,
          fonte: 'cache',
        },
      };
    }

    const resultado = this.modoSimulado
      ? this.simularFrete(dto)
      : await this.consultarCorreiosSOAP(dto);

    if (resultado.valor > 0) {
      this.ratesCache.set(dto.cepOrigem, dto.cepDestino, servico, dto.peso, resultado.valor, resultado.prazoDias);
    }

    return {
      success: true,
      data: { ...resultado, fonte: this.modoSimulado ? 'simulado' : 'correios' },
    };
  }

  async rastrearObjeto(codigo: string): Promise<any> {
    if (this.correiosToken) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${this.rastroUrl}/${codigo}`, {
            headers: { Authorization: `Bearer ${this.correiosToken}` },
            timeout: 10000,
          }),
        );
        const eventos: EventoRastreioDto[] = (response.data?.objetos?.[0]?.eventos || []).map((ev: any) => ({
          data: ev.data || '',
          hora: ev.hora || '',
          local: ev.local || '',
          cidade: ev.cidade || '',
          uf: ev.uf || '',
          status: ev.status || '',
          descricao: ev.descricao || '',
        }));
        return {
          success: true,
          data: {
            codigo,
            eventos,
            ultimaAtualizacao: response.data?.objetos?.[0]?.ultimaAtualizacao,
            situacao: response.data?.objetos?.[0]?.situacao,
          },
        };
      } catch (error: any) {
        this.logger.warn(`Falha ao rastrear nos Correios: ${error.message}. Usando simulação.`);
      }
    }

    return this.simularRastreio(codigo);
  }

  private simularRastreio(codigo: string): any {
    const agora = new Date();
    const diasAtras = (dias: number) => {
      const d = new Date(agora);
      d.setDate(d.getDate() - dias);
      return d.toLocaleDateString('pt-BR');
    };
    const eventos = [
      { data: diasAtras(5), hora: '08:30', local: 'Centro de Distribuição', cidade: 'São Paulo', uf: 'SP', status: 'Postado', descricao: 'Objeto postado após o horário limite' },
      { data: diasAtras(4), hora: '14:15', local: 'Unidade de Tratamento', cidade: 'São Paulo', uf: 'SP', status: 'Encaminhado', descricao: 'Objeto em trânsito para unidade de distribuição' },
      { data: diasAtras(2), hora: '09:45', local: 'Centro de Distribuição', cidade: 'Campinas', uf: 'SP', status: 'Encaminhado', descricao: 'Objeto em trânsito' },
      { data: diasAtras(1), hora: '07:20', local: 'Agência dos Correios', cidade: 'Campinas', uf: 'SP', status: 'Saiu para entrega', descricao: 'Objeto saiu para entrega ao destinatário' },
    ];
    const ultimo = eventos[eventos.length - 1];
    return {
      success: true,
      data: {
        codigo,
        eventos,
        ultimaAtualizacao: `${ultimo.data} ${ultimo.hora}`,
        situacao: 'Saiu para entrega',
        fonte: 'simulado',
      },
    };
  }

  async consultarCEP(cep: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.viaCepUrl}/${cep}/json/`, { timeout: 8000 }),
      );
      if (response.data?.erro) {
        throw new NotFoundException('CEP não encontrado');
      }
      return {
        success: true,
        data: {
          cep: response.data.cep,
          logradouro: response.data.logradouro,
          complemento: response.data.complemento,
          bairro: response.data.bairro,
          cidade: response.data.localidade,
          uf: response.data.uf,
          ddd: response.data.ddd,
          ibge: response.data.ibge,
          fonte: 'viacep',
        },
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.warn(`Falha ViaCEP: ${error.message}. Usando simulação.`);
      return this.simularCEP(cep);
    }
  }

  private simularCEP(cep: string): any {
    const cepLimpo = cep.replace(/\D/g, '');
    return {
      success: true,
      data: {
        cep: cepLimpo,
        logradouro: 'Rua Exemplo (CEP simulado)',
        complemento: '',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        ddd: '11',
        ibge: '3550308',
        fonte: 'simulado',
      },
    };
  }

  async solicitarColeta(dados: ColetaData): Promise<any> {
    const solicitacao = `COL${Date.now()}${Math.random().toString(36).slice(-6).toUpperCase()}`;
    this.logger.log(`Coleta solicitada: ${solicitacao} - ${dados.razaoSocial}`);
    return {
      success: true,
      data: {
        solicitacao,
        status: 'AGENDADA',
        dataAgendada: dados.dataColeta,
        horario: `${dados.horaInicial} às ${dados.horaFinal}`,
        observacao: 'Coleta simulada - em modo de desenvolvimento',
      },
    };
  }
}
