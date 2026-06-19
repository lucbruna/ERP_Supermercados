import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAutomacaoDto, UpdateAutomacaoDto, AutomacaoQueryDto } from './dto/create-automacao.dto';
import { AutomacaoGatilho } from '@prisma/client';

@Injectable()
export class AutomacoesService {
  private readonly logger = new Logger(AutomacoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAutomacaoDto) {
    const automacao = await this.prisma.regraAutomacao.create({
      data: {
        companyId: dto.companyId,
        nome: dto.nome,
        gatilho: dto.gatilho,
        acao: dto.acao,
        modeloMensagemId: dto.modeloMensagemId,
        parametros: dto.parametros || [],
        ativo: dto.ativo ?? true,
      },
    });

    this.logger.log(`Automação criada: ${automacao.nome}`);
    return { success: true, data: automacao };
  }

  async findAll(companyId: string, query: AutomacaoQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (query.search) {
      where.nome = { contains: query.search, mode: 'insensitive' };
    }
    if (query.gatilho) where.gatilho = query.gatilho;
    if (query.ativo !== undefined) where.ativo = query.ativo;

    const [data, total] = await Promise.all([
      this.prisma.regraAutomacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.regraAutomacao.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const automacao = await this.prisma.regraAutomacao.findUnique({ where: { id } });
    if (!automacao) throw new NotFoundException('Automação não encontrada');
    return { success: true, data: automacao };
  }

  async update(id: string, dto: UpdateAutomacaoDto) {
    await this.findOne(id);
    const updated = await this.prisma.regraAutomacao.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.regraAutomacao.delete({ where: { id } });
    return { success: true, message: 'Automação removida com sucesso' };
  }

  async ativar(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.regraAutomacao.update({
      where: { id },
      data: { ativo: true },
    });
    return { success: true, data: updated };
  }

  async desativar(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.regraAutomacao.update({
      where: { id },
      data: { ativo: false },
    });
    return { success: true, data: updated };
  }

  async processar(gatilho: string, dados: any) {
    const automacoes = await this.prisma.regraAutomacao.findMany({
      where: {
        gatilho: gatilho as AutomacaoGatilho,
        ativo: true,
      },
    });

    if (automacoes.length === 0) {
      return { success: true, message: 'Nenhuma automação ativa encontrada para este gatilho' };
    }

    this.logger.log(`Processando ${automacoes.length} automação(ões) para gatilho ${gatilho}`);

    const resultados = await Promise.all(
      automacoes.map(async (automacao) => {
        try {
          this.logger.log(`Executando automação: ${automacao.nome}`);
          return { automacaoId: automacao.id, nome: automacao.nome, executado: true };
        } catch (error) {
          this.logger.error(`Erro na automação ${automacao.nome}: ${error.message}`);
          return { automacaoId: automacao.id, nome: automacao.nome, executado: false, erro: error.message };
        }
      }),
    );

    return { success: true, data: resultados };
  }
}
