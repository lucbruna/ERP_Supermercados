import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateCertificacaoDto, UpdateCertificacaoDto, CertificacaoQueryDto,
  ConcederCertificacaoDto, RenovarCertificacaoDto,
} from './dto/certificacoes.dto';

@Injectable()
export class CertificacoesService {
  private readonly logger = new Logger(CertificacoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCertificacaoDto) {
    const certificacao = await this.prisma.certificacao.create({ data: dto });
    this.logger.log(`Certificação criada: ${certificacao.nome}`);
    return { success: true, data: certificacao };
  }

  async findAll(query: CertificacaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    if (query.funcionarioId) {
      const data = await this.prisma.funcionarioCertificacao.findMany({
        where: { funcionarioId: query.funcionarioId, ...(query.status ? { status: query.status } : {}) },
        skip,
        take: limit,
        orderBy: { dataValidade: 'asc' },
        include: { certificacao: true },
      });
      const total = await this.prisma.funcionarioCertificacao.count({
        where: { funcionarioId: query.funcionarioId },
      });
      return {
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    const where: any = {};
    if (query.nome) where.nome = { contains: query.nome, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.certificacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { funcionarios: true } } },
      }),
      this.prisma.certificacao.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async vencendo() {
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() + 30);

    const data = await this.prisma.funcionarioCertificacao.findMany({
      where: {
        status: 'Valida',
        dataValidade: { lte: trintaDias },
      },
      orderBy: { dataValidade: 'asc' },
      include: { certificacao: true },
    });

    return { success: true, data };
  }

  async findOne(id: string) {
    const certificacao = await this.prisma.certificacao.findUnique({
      where: { id },
      include: {
        funcionarios: {
          include: { certificacao: true },
          orderBy: { dataObtencao: 'desc' },
        },
      },
    });
    if (!certificacao) throw new NotFoundException('Certificação não encontrada');
    return { success: true, data: certificacao };
  }

  async update(id: string, dto: UpdateCertificacaoDto) {
    await this.findOne(id);
    const updated = await this.prisma.certificacao.update({ where: { id }, data: dto });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.funcionarioCertificacao.deleteMany({ where: { certificacaoId: id } });
    await this.prisma.certificacao.delete({ where: { id } });
    return { success: true, message: 'Certificação removida' };
  }

  async conceder(id: string, dto: ConcederCertificacaoDto) {
    const certificacao = await this.prisma.certificacao.findUnique({ where: { id } });
    if (!certificacao) throw new NotFoundException('Certificação não encontrada');

    const existente = await this.prisma.funcionarioCertificacao.findUnique({
      where: { funcionarioId_certificacaoId: { funcionarioId: dto.funcionarioId, certificacaoId: id } },
    });
    if (existente) throw new ConflictException('Funcionário já possui esta certificação');

    const dataObtencao = new Date(dto.dataObtencao);
    const dataValidade = new Date(dataObtencao);
    dataValidade.setMonth(dataValidade.getMonth() + certificacao.validadeMeses);

    const concedida = await this.prisma.funcionarioCertificacao.create({
      data: {
        funcionarioId: dto.funcionarioId,
        certificacaoId: id,
        dataObtencao,
        dataValidade,
        documentoPath: dto.documentoPath,
        observacoes: dto.observacoes,
      },
      include: { certificacao: true },
    });

    return { success: true, data: concedida };
  }

  async renovar(id: string, dto: RenovarCertificacaoDto) {
    const vinculo = await this.prisma.funcionarioCertificacao.findFirst({
      where: { certificacaoId: id },
      orderBy: { dataValidade: 'desc' },
    });
    if (!vinculo) throw new NotFoundException('Nenhum vínculo encontrado para renovação');

    const updated = await this.prisma.funcionarioCertificacao.update({
      where: { id: vinculo.id },
      data: {
        dataValidade: new Date(dto.novaDataValidade),
        status: 'Valida',
        observacoes: dto.observacoes,
      },
    });

    return { success: true, data: updated };
  }
}
