import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { AnonymizationService } from '../anonymization/anonymization.service';
import {
  ConsentimentoDto,
  CriarSolicitacaoDto,
  ProcessarSolicitacaoDto,
  RegistrarDadosPessoaisDto,
  CriarPoliticaDto,
  ListarSolicitacoesDto,
} from './dto/lgpd.dto';

@Injectable()
export class LgpdService {
  private readonly logger = new Logger(LgpdService.name);

  constructor(
    private prisma: PrismaService,
    private anonymization: AnonymizationService,
  ) {}

  async consentir(usuarioId: string, dto: ConsentimentoDto, ip: string, userAgent: string) {
    const consentimento = await this.prisma.consentimentoLGPD.create({
      data: {
        usuarioId,
        tipo: dto.tipo,
        concedido: dto.concedido,
        dataRevogacao: dto.concedido ? null : new Date(),
        ip,
        userAgent,
      },
    });

    this.logger.log(`Consentimento ${dto.tipo} registrado para ${usuarioId}: ${dto.concedido}`);
    return { success: true, data: consentimento };
  }

  async listarConsentimentos(usuarioId: string) {
    const consents = await this.prisma.consentimentoLGPD.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: consents };
  }

  async criarSolicitacaoTitular(dto: CriarSolicitacaoDto) {
    const prazoResposta = new Date();
    prazoResposta.setDate(prazoResposta.getDate() + 15);

    const solicitacao = await this.prisma.solicitacaoTitular.create({
      data: {
        usuarioId: dto.usuarioId,
        tipo: dto.tipo,
        descricao: dto.descricao,
        dadosRelacionados: dto.dadosRelacionados,
        status: 'PENDENTE',
        prazoResposta,
      },
    });

    this.logger.log(`Solicitação ${dto.tipo} criada para ${dto.usuarioId}`);
    return { success: true, data: solicitacao };
  }

  async processarSolicitacao(id: string, dto: ProcessarSolicitacaoDto) {
    const solicitacao = await this.prisma.solicitacaoTitular.findUnique({ where: { id } });
    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');

    const updated = await this.prisma.solicitacaoTitular.update({
      where: { id },
      data: {
        status: dto.status,
        resposta: dto.resposta,
        concluidoEm: dto.status === 'CONCLUIDA' || dto.status === 'NEGADA' ? new Date() : null,
      },
    });

    return { success: true, data: updated };
  }

  async listarSolicitacoes(filtros: ListarSolicitacoesDto) {
    const page = filtros.page || 1;
    const limit = filtros.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.status) where.status = filtros.status;

    const [solicitacoes, total] = await Promise.all([
      this.prisma.solicitacaoTitular.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
      }),
      this.prisma.solicitacaoTitular.count({ where }),
    ]);

    return {
      success: true,
      data: solicitacoes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async anonimizarDados(usuarioId: string) {
    const dadosPessoais = await this.prisma.dadosPessoais.findMany({
      where: { usuarioId },
    });

    for (const dado of dadosPessoais) {
      await this.prisma.dadosPessoais.update({
        where: { id: dado.id },
        data: {
          hash: this.anonymization.anonymizeRecord({ value: dado.hash }, ['value']).value,
        },
      });
    }

    this.logger.log(`Dados anonimizados para ${usuarioId} (${dadosPessoais.length} registros)`);
    return {
      success: true,
      message: `Dados anonimizados com sucesso (${dadosPessoais.length} registros)`,
    };
  }

  async excluirDados(usuarioId: string) {
    await this.prisma.dadosPessoais.updateMany({
      where: { usuarioId },
      data: {
        hash: this.anonymization.anonymizeName('ANONYMIZED_DATA'),
        finalidade: 'ANONYMIZED_LGPD_ART18_VI',
      },
    });

    await this.prisma.consentimentoLGPD.updateMany({
      where: { usuarioId, concedido: true },
      data: { concedido: false, dataRevogacao: new Date() },
    });

    this.logger.log(`Dados excluídos/anonimizados para ${usuarioId}`);
    return {
      success: true,
      message: 'Dados excluídos com sucesso conforme LGPD Art. 18 VI',
    };
  }

  async exportarDados(usuarioId: string) {
    const [consentimentos, solicitacoes, dadosPessoais, aceites] = await Promise.all([
      this.prisma.consentimentoLGPD.findMany({ where: { usuarioId } }),
      this.prisma.solicitacaoTitular.findMany({ where: { usuarioId } }),
      this.prisma.dadosPessoais.findMany({ where: { usuarioId } }),
      this.prisma.aceitePolitica.findMany({ where: { usuarioId } }),
    ]);

    return {
      success: true,
      data: {
        metadados: {
          exportadoEm: new Date().toISOString(),
          usuarioId,
          baseLegal: 'LGPD Art. 18 V - Portabilidade',
        },
        consentimentos,
        solicitacoes,
        dadosPessoais,
        aceitesPolitica: aceites,
      },
    };
  }

  async registrarDadosPessoais(dto: RegistrarDadosPessoaisDto) {
    const hash = this.hashData(dto.valor);

    const dado = await this.prisma.dadosPessoais.create({
      data: {
        usuarioId: dto.usuarioId,
        tipo: dto.tipo,
        hash,
        finalidade: dto.finalidade,
        origem: dto.origem,
      },
    });

    return { success: true, data: dado };
  }

  async listarDadosPessoais(usuarioId: string) {
    const dados = await this.prisma.dadosPessoais.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data: dados };
  }

  async criarPolitica(dto: CriarPoliticaDto) {
    await this.prisma.politicaPrivacidade.updateMany({
      where: { ativo: true },
      data: { ativo: false },
    });

    const politica = await this.prisma.politicaPrivacidade.create({
      data: {
        versao: dto.versao,
        texto: dto.texto,
        dataPublicacao: dto.dataPublicacao ? new Date(dto.dataPublicacao) : new Date(),
        dataInicioVigencia: dto.dataInicioVigencia ? new Date(dto.dataInicioVigencia) : new Date(),
        ativo: true,
      },
    });

    return { success: true, data: politica };
  }

  async listarPoliticas() {
    const politicas = await this.prisma.politicaPrivacidade.findMany({
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data: politicas };
  }

  async aceitarPolitica(politicaId: string, usuarioId: string, ip: string) {
    const politica = await this.prisma.politicaPrivacidade.findUnique({
      where: { id: politicaId },
    });
    if (!politica) throw new NotFoundException('Política de privacidade não encontrada');

    const aceite = await this.prisma.aceitePolitica.create({
      data: { usuarioId, politicaId, aceito: true, ip },
    });

    return { success: true, data: aceite };
  }

  async getComplianceStatus() {
    const [totalConsentimentos, politicasAtivas, totalDados, solicitacoesPendentes] =
      await Promise.all([
        this.prisma.consentimentoLGPD.count(),
        this.prisma.politicaPrivacidade.count({ where: { ativo: true } }),
        this.prisma.dadosPessoais.count(),
        this.prisma.solicitacaoTitular.count({
          where: { status: { in: ['PENDENTE', 'EM_ANDAMENTO'] } },
        }),
      ]);

    return {
      success: true,
      data: {
        consentimentoRegistrado: totalConsentimentos > 0,
        politicaPrivacidadePublicada: politicasAtivas > 0,
        dadosPessoaisMapeados: totalDados > 0,
        canalSolicitacaoTitular: true,
        prazoResposta15Dias: true,
        anonimizacaoImplementada: true,
        retencaoDefinida: true,
        detalhes: {
          totalConsentimentos,
          totalPoliticasAtivas: politicasAtivas,
          totalDadosPessoais: totalDados,
          totalSolicitacoesPendentes: solicitacoesPendentes,
        },
      },
    };
  }

  private hashData(valor: string): string {
    return crypto.createHash('sha256').update(valor).digest('hex');
  }
}
