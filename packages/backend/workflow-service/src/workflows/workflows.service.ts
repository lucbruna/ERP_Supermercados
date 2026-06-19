import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateWorkflowDto, UpdateWorkflowDto, WorkflowQueryDto, CloneWorkflowDto } from './dto/workflow.dto';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkflowDto) {
    const workflow = await this.prisma.workflow.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        categoria: dto.categoria,
        ativo: dto.ativo ?? true,
        versao: dto.versao ?? 1,
      },
      include: { estados: true, transicoes: true },
    });
    this.logger.log(`Workflow created: ${workflow.nome} (${workflow.id})`);
    return { success: true, data: workflow };
  }

  async findAll(query: WorkflowQueryDto) {
    const where: any = {};
    if (query.categoria) where.categoria = query.categoria;
    if (query.ativo !== undefined) where.ativo = query.ativo === 'true';
    const data = await this.prisma.workflow.findMany({
      where,
      include: { estados: { orderBy: { ordem: 'asc' } }, _count: { select: { instancias: true } } },
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        estados: { orderBy: { ordem: 'asc' } },
        transicoes: true,
        regras: { where: { ativo: true } },
      },
    });
    if (!data) throw new NotFoundException('Workflow not found');
    return { success: true, data };
  }

  async update(id: string, dto: UpdateWorkflowDto) {
    await this.findOne(id);
    const data = await this.prisma.workflow.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workflow.delete({ where: { id } });
    return { success: true, data: { message: 'Workflow deleted' } };
  }

  async clone(id: string, dto: CloneWorkflowDto) {
    const original = await this.prisma.workflow.findUnique({
      where: { id },
      include: { estados: true, transicoes: true },
    });
    if (!original) throw new NotFoundException('Workflow not found');

    const newVersao = original.versao + 1;

    const estadoMap = new Map<string, string>();

    const workflow = await this.prisma.workflow.create({
      data: {
        nome: dto.nome || original.nome,
        descricao: original.descricao,
        categoria: original.categoria,
        ativo: original.ativo,
        versao: newVersao,
      },
    });

    for (const estado of original.estados) {
      const novo = await this.prisma.workflowEstado.create({
        data: {
          workflowId: workflow.id,
          nome: estado.nome,
          tipo: estado.tipo,
          ordem: estado.ordem,
          configJson: estado.configJson as any,
        },
      });
      estadoMap.set(estado.id, novo.id);
    }

    for (const transicao of original.transicoes) {
      await this.prisma.workflowTransicao.create({
        data: {
          workflowId: workflow.id,
          estadoOrigemId: estadoMap.get(transicao.estadoOrigemId),
          estadoDestinoId: estadoMap.get(transicao.estadoDestinoId),
          nome: transicao.nome,
          condicaoJson: transicao.condicaoJson as any,
          acaoJson: transicao.acaoJson as any,
        },
      });
    }

    this.logger.log(`Workflow cloned: ${original.nome} v${original.versao} -> v${newVersao}`);
    return { success: true, data: workflow };
  }
}
