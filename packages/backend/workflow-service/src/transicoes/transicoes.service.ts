import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransicaoDto, UpdateTransicaoDto } from './dto/transicao.dto';

@Injectable()
export class TransicoesService {
  private readonly logger = new Logger(TransicoesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(workflowId: string, dto: CreateTransicaoDto) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const origem = await this.prisma.workflowEstado.findUnique({ where: { id: dto.estadoOrigemId } });
    if (!origem || origem.workflowId !== workflowId)
      throw new NotFoundException('Estado origem not found in this workflow');

    const destino = await this.prisma.workflowEstado.findUnique({ where: { id: dto.estadoDestinoId } });
    if (!destino || destino.workflowId !== workflowId)
      throw new NotFoundException('Estado destino not found in this workflow');

    const data = await this.prisma.workflowTransicao.create({
      data: {
        workflowId,
        estadoOrigemId: dto.estadoOrigemId,
        estadoDestinoId: dto.estadoDestinoId,
        nome: dto.nome,
        condicaoJson: dto.condicaoJson ?? undefined,
        acaoJson: dto.acaoJson ?? undefined,
      },
    });
    this.logger.log(`Transicao created: ${data.nome} (${data.id})`);
    return { success: true, data };
  }

  async findAll(workflowId: string) {
    const data = await this.prisma.workflowTransicao.findMany({
      where: { workflowId },
      include: {
        estadoOrigem: true,
        estadoDestino: true,
      },
      orderBy: { criadoEm: 'asc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflowTransicao.findUnique({
      where: { id },
      include: { estadoOrigem: true, estadoDestino: true },
    });
    if (!data) throw new NotFoundException('Transicao not found');
    return { success: true, data };
  }

  async update(id: string, dto: UpdateTransicaoDto) {
    await this.findOne(id);
    const data = await this.prisma.workflowTransicao.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workflowTransicao.delete({ where: { id } });
    return { success: true, data: { message: 'Transicao deleted' } };
  }

  async getDisponiveis(instanciaId: string) {
    const instancia = await this.prisma.workflowInstancia.findUnique({
      where: { id: instanciaId },
      include: { workflow: true },
    });
    if (!instancia) throw new NotFoundException('Instancia not found');
    if (instancia.status !== 'ATIVA') throw new NotFoundException('Instance is not active');

    const transicoes = await this.prisma.workflowTransicao.findMany({
      where: {
        workflowId: instancia.workflowId,
        estadoOrigemId: instancia.estadoAtualId,
      },
      include: { estadoDestino: true },
    });

    const instanceData = (instancia.dadosJson as Record<string, any>) || {};

    const disponiveis = transicoes.filter((t) => {
      if (!t.condicaoJson) return true;
      return this.evaluateCondition(t.condicaoJson as Record<string, any>, instanceData);
    });

    return { success: true, data: disponiveis };
  }

  private evaluateCondition(condition: Record<string, any>, data: Record<string, any>): boolean {
    const { campo, operador, valor } = condition;
    if (!campo || !operador) return true;

    const campoValor = this.getNestedValue(data, campo);

    switch (operador) {
      case 'equals': return campoValor === valor;
      case 'notEquals': return campoValor !== valor;
      case 'greaterThan': return campoValor > valor;
      case 'lessThan': return campoValor < valor;
      case 'greaterThanOrEqual': return campoValor >= valor;
      case 'lessThanOrEqual': return campoValor <= valor;
      case 'contains': return String(campoValor || '').includes(String(valor));
      case 'notContains': return !String(campoValor || '').includes(String(valor));
      case 'in': return Array.isArray(valor) && valor.includes(campoValor);
      case 'notIn': return Array.isArray(valor) && !valor.includes(campoValor);
      case 'isEmpty': return !campoValor || (Array.isArray(campoValor) && campoValor.length === 0);
      case 'isNotEmpty': return campoValor !== null && campoValor !== undefined && campoValor !== '';
      case 'startsWith': return String(campoValor || '').startsWith(String(valor));
      case 'endsWith': return String(campoValor || '').endsWith(String(valor));
      default: return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
  }
}
