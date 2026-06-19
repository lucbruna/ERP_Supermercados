import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RegistrarRegraDto, DispararAutomacaoDto, RegraQueryDto } from './dto/automacao.dto';

@Injectable()
export class AutomacaoService {
  private readonly logger = new Logger(AutomacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: RegistrarRegraDto) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: dto.workflowId } });
    if (!workflow) {
      return { success: false, data: null, error: 'Workflow not found' };
    }

    const data = await this.prisma.workflowRegra.create({
      data: {
        workflowId: dto.workflowId,
        nome: dto.nome,
        descricao: dto.descricao,
        condicaoJson: dto.condicaoJson,
        prioridade: dto.prioridade ?? 0,
        ativo: true,
      },
    });
    this.logger.log(`Regra registered: ${data.nome} (${data.id})`);
    return { success: true, data };
  }

  async listarRegras(query: RegraQueryDto) {
    const where: any = { ativo: true };
    const data = await this.prisma.workflowRegra.findMany({
      where,
      include: { workflow: { select: { id: true, nome: true, categoria: true } } },
      orderBy: { prioridade: 'desc' },
    });
    return { success: true, data };
  }

  async disparar(dto: DispararAutomacaoDto) {
    const regras = await this.prisma.workflowRegra.findMany({
      where: { ativo: true },
      include: { workflow: { include: { estados: { where: { tipo: 'INICIAL' }, take: 1 } } } },
      orderBy: { prioridade: 'desc' },
    });

    const resultados: any[] = [];

    for (const regra of regras) {
      const condicao = regra.condicaoJson as Record<string, any>;
      if (!condicao) continue;

      if (condicao.entidadeTipo && condicao.entidadeTipo !== dto.entidadeTipo) continue;

      if (this.evaluateCondition(condicao, dto.dadosJson || {})) {
        if (regra.workflow.estados.length > 0) {
          const existing = await this.prisma.workflowInstancia.findFirst({
            where: {
              workflowId: regra.workflowId,
              entidadeTipo: dto.entidadeTipo,
              entidadeId: dto.entidadeId,
              status: 'ATIVA',
            },
          });

          if (!existing) {
            const instancia = await this.prisma.workflowInstancia.create({
              data: {
                workflowId: regra.workflowId,
                entidadeTipo: dto.entidadeTipo,
                entidadeId: dto.entidadeId,
                estadoAtualId: regra.workflow.estados[0].id,
                status: 'ATIVA',
                dadosJson: dto.dadosJson ?? undefined,
              },
            });

            await this.prisma.workflowHistorico.create({
              data: {
                instanciaId: instancia.id,
                estadoDestinoId: regra.workflow.estados[0].id,
                acao: 'AUTOMACAO',
                dadosJson: { regra: regra.nome },
              },
            });

            resultados.push({
              regra: regra.nome,
              instanciaId: instancia.id,
              acao: 'INSTANCIA_CRIADA',
            });
            this.logger.log(`Automation triggered: ${regra.nome} -> instancia ${instancia.id}`);
          } else {
            resultados.push({
              regra: regra.nome,
              instanciaId: existing.id,
              acao: 'JA_EXISTE',
            });
          }
        }
      }
    }

    return { success: true, data: resultados };
  }

  private evaluateCondition(condition: Record<string, any>, data: Record<string, any>): boolean {
    const { campo, operador, valor } = condition;
    if (!campo || !operador) {
      if (condition.entidadeTipo) return true;
      return false;
    }

    const campoValor = this.getNestedValue(data, campo);

    switch (operador) {
      case 'equals': return campoValor === valor;
      case 'notEquals': return campoValor !== valor;
      case 'greaterThan': return Number(campoValor) > Number(valor);
      case 'lessThan': return Number(campoValor) < Number(valor);
      case 'greaterThanOrEqual': return Number(campoValor) >= Number(valor);
      case 'lessThanOrEqual': return Number(campoValor) <= Number(valor);
      case 'contains': return String(campoValor || '').includes(String(valor));
      case 'in': return Array.isArray(valor) && valor.includes(campoValor);
      case 'isEmpty': return !campoValor || (Array.isArray(campoValor) && campoValor.length === 0);
      case 'isNotEmpty': return campoValor !== null && campoValor !== undefined && campoValor !== '';
      default: return true;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
  }
}
