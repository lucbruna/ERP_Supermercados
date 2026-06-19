import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateContratoDto,
  UpdateContratoDto,
  ContratoQueryDto,
  AditarContratoDto,
  RescindirContratoDto,
  DocumentoContratoDto,
} from './dto/create-contrato.dto';

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(private prisma: PrismaService) {}

  private async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const seq = await this.prisma.contrato.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });
    return `CT-${year}-${String(seq + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateContratoDto) {
    const tipo = await this.prisma.tipoContrato.findUnique({
      where: { id: dto.tipoContratoId },
    });
    if (!tipo) throw new NotFoundException('Tipo de contrato não encontrado');

    const numero = await this.generateNumero();

    const contrato = await this.prisma.contrato.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipoContratoId: dto.tipoContratoId,
        numero,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        dataExperienciaInicio: dto.dataExperienciaInicio ? new Date(dto.dataExperienciaInicio) : null,
        dataExperienciaFim: dto.dataExperienciaFim ? new Date(dto.dataExperienciaFim) : null,
        dataEfetivacao: dto.dataEfetivacao ? new Date(dto.dataEfetivacao) : null,
        salarioBase: dto.salarioBase,
        jornadaSemanal: dto.jornadaSemanal,
        horarioEntrada: dto.horarioEntrada,
        horarioSaida: dto.horarioSaida,
        intervaloRefeicao: dto.intervaloRefeicao,
        cargo: dto.cargo,
        funcao: dto.funcao,
        cbo: dto.cbo,
        cnpjEmpregador: dto.cnpjEmpregador,
        razaoSocialEmpregador: dto.razaoSocialEmpregador,
        localTrabalho: dto.localTrabalho,
        tipoJornada: dto.tipoJornada,
        valorValeTransporte: dto.valorValeTransporte,
        valorValeRefeicao: dto.valorValeRefeicao,
        valorPlanoSaude: dto.valorPlanoSaude,
        observacoes: dto.observacoes,
        createdBy: dto.createdBy,
      },
      include: { tipoContrato: true },
    });

    this.logger.log(`Contrato criado: ${numero}`);
    return { success: true, data: contrato };
  }

  async findAll(query: ContratoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.funcionarioId) where.funcionarioId = query.funcionarioId;
    if (query.tipo) where.tipoContratoId = query.tipo;

    const [data, total] = await Promise.all([
      this.prisma.contrato.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { tipoContrato: true },
      }),
      this.prisma.contrato.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        tipoContrato: true,
        aditivos: { orderBy: { data: 'desc' } },
        rescisoes: { orderBy: { createdAt: 'desc' } },
        documentos: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');
    return { success: true, data: contrato };
  }

  async update(id: string, dto: UpdateContratoDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.dataFim) data.dataFim = new Date(dto.dataFim);
    if (dto.dataExperienciaInicio) data.dataExperienciaInicio = new Date(dto.dataExperienciaInicio);
    if (dto.dataExperienciaFim) data.dataExperienciaFim = new Date(dto.dataExperienciaFim);
    if (dto.dataEfetivacao) data.dataEfetivacao = new Date(dto.dataEfetivacao);

    const updated = await this.prisma.contrato.update({
      where: { id },
      data,
      include: { tipoContrato: true },
    });

    return { success: true, data: updated };
  }

  async findAditivos(contratoId: string) {
    await this.findOne(contratoId);
    const aditivos = await this.prisma.aditivoContrato.findMany({
      where: { contratoId },
      orderBy: { data: 'desc' },
    });
    return { success: true, data: aditivos };
  }

  async findDocumentos(contratoId: string) {
    await this.findOne(contratoId);
    const documentos = await this.prisma.documentoContrato.findMany({
      where: { contratoId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: documentos };
  }

  async aditar(contratoId: string, dto: AditarContratoDto) {
    const contrato = await this.findOne(contratoId);

    const aditivo = await this.prisma.aditivoContrato.create({
      data: {
        contratoId,
        data: new Date(dto.data),
        tipo: dto.tipo,
        descricao: dto.descricao,
        valorAnterior: dto.valorAnterior,
        valorNovo: dto.valorNovo,
        dataInicial: dto.dataInicial ? new Date(dto.dataInicial) : null,
        dataFinal: dto.dataFinal ? new Date(dto.dataFinal) : null,
        documentoPath: dto.documentoPath,
        createdBy: dto.createdBy,
      },
    });

    if (dto.tipo === 'Suspensao') {
      await this.prisma.contrato.update({
        where: { id: contratoId },
        data: { status: 'Suspenso' },
      });
    }

    this.logger.log(`Aditivo criado para contrato ${contrato.data.numero}: ${dto.tipo}`);
    return { success: true, data: aditivo };
  }

  async rescindir(contratoId: string, dto: RescindirContratoDto) {
    const contrato = await this.findOne(contratoId);
    if (contrato.data.status === 'Encerrado') {
      throw new BadRequestException('Contrato já está encerrado');
    }

    const valorTotal =
      (dto.saldoSalario || 0) +
      (dto.feriasVencidas || 0) +
      (dto.feriasProporcionais || 0) +
      (dto.decimoTerceiro || 0) +
      (dto.avisoPrevioValor || 0) +
      (dto.multaFGTS || 0) +
      (dto.indenizacao || 0);

    const rescisao = await this.prisma.termoRescisao.create({
      data: {
        contratoId,
        dataRescisao: new Date(dto.dataRescisao),
        tipoRescisao: dto.tipoRescisao,
        avisoPrevio: dto.avisoPrevio,
        dataAvisoPrevio: dto.dataAvisoPrevio ? new Date(dto.dataAvisoPrevio) : null,
        dataBaixaCTPS: dto.dataBaixaCTPS ? new Date(dto.dataBaixaCTPS) : null,
        saldoSalario: dto.saldoSalario,
        feriasVencidas: dto.feriasVencidas,
        feriasProporcionais: dto.feriasProporcionais,
        decimoTerceiro: dto.decimoTerceiro,
        avisoPrevioValor: dto.avisoPrevioValor,
        multaFGTS: dto.multaFGTS,
        indenizacao: dto.indenizacao,
        valorTotal,
        observacoes: dto.observacoes,
        createdBy: dto.createdBy,
      },
    });

    await this.prisma.contrato.update({
      where: { id: contratoId },
      data: {
        status: 'Encerrado',
        dataFim: new Date(dto.dataRescisao),
        updatedBy: dto.createdBy,
      },
    });

    this.logger.log(`Contrato rescindido: ${contrato.data.numero}`);
    return { success: true, data: rescisao };
  }

  async suspender(contratoId: string, motivo?: string) {
    const contrato = await this.findOne(contratoId);
    if (contrato.data.status === 'Encerrado') {
      throw new BadRequestException('Não é possível suspender um contrato encerrado');
    }

    const updated = await this.prisma.contrato.update({
      where: { id: contratoId },
      data: { status: 'Suspenso', observacoes: motivo },
    });

    this.logger.log(`Contrato suspenso: ${contrato.data.numero}`);
    return { success: true, data: updated };
  }

  async reativar(contratoId: string) {
    const contrato = await this.findOne(contratoId);
    if (contrato.data.status !== 'Suspenso') {
      throw new BadRequestException('Apenas contratos suspensos podem ser reativados');
    }

    const updated = await this.prisma.contrato.update({
      where: { id: contratoId },
      data: { status: 'Ativo' },
    });

    this.logger.log(`Contrato reativado: ${contrato.data.numero}`);
    return { success: true, data: updated };
  }

  async addDocumento(contratoId: string, dto: DocumentoContratoDto) {
    await this.findOne(contratoId);

    const documento = await this.prisma.documentoContrato.create({
      data: {
        contratoId,
        tipo: dto.tipo,
        nome: dto.nome,
        descricao: dto.descricao,
        caminhoArquivo: dto.caminhoArquivo,
        createdBy: dto.createdBy,
      },
    });

    return { success: true, data: documento };
  }

  async findVencendo() {
    const hoje = new Date();
    const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const data = await this.prisma.contrato.findMany({
      where: {
        status: 'Ativo',
        OR: [
          { dataExperienciaFim: { gte: hoje, lte: trintaDias } },
          { dataFim: { gte: hoje, lte: trintaDias } },
        ],
      },
      include: { tipoContrato: true },
      orderBy: [{ dataExperienciaFim: 'asc' }, { dataFim: 'asc' }],
    });

    return { success: true, data };
  }

  async relatorioIndicadores() {
    const hoje = new Date();
    const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [ativos, suspensos, total, vencendo, agregacao] = await Promise.all([
      this.prisma.contrato.count({ where: { status: 'Ativo' } }),
      this.prisma.contrato.count({ where: { status: 'Suspenso' } }),
      this.prisma.contrato.count(),
      this.prisma.contrato.count({
        where: {
          status: 'Ativo',
          OR: [
            { dataExperienciaFim: { gte: hoje, lte: trintaDias } },
            { dataFim: { gte: hoje, lte: trintaDias } },
          ],
        },
      }),
      this.prisma.contrato.aggregate({
        where: { status: 'Ativo' },
        _avg: { salarioBase: true },
        _min: { salarioBase: true },
        _max: { salarioBase: true },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        ativos,
        suspensos,
        encerrados: total - ativos - suspensos,
        vencendoEm30Dias: vencendo,
        salarioMedio: agregacao._avg.salarioBase,
        salarioMinimo: agregacao._min.salarioBase,
        salarioMaximo: agregacao._max.salarioBase,
      },
    };
  }
}
