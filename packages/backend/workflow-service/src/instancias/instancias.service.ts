import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { IniciarInstanciaDto, InstanciaQueryDto, TransitarInstanciaDto, CancelarInstanciaDto } from './dto/instancia.dto';

@Injectable()
export class InstanciasService {
  private readonly logger = new Logger(InstanciasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async iniciar(dto: IniciarInstanciaDto) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: dto.workflowId },
      include: { estados: { where: { tipo: 'INICIAL' }, orderBy: { ordem: 'asc' }, take: 1 } },
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    if (!workflow.ativo) throw new BadRequestException('Workflow is inactive');
    if (workflow.estados.length === 0) throw new BadRequestException('Workflow has no initial state');

    const estadoInicial = workflow.estados[0];

    const data = await this.prisma.workflowInstancia.create({
      data: {
        workflowId: dto.workflowId,
        entidadeTipo: dto.entidadeTipo,
        entidadeId: dto.entidadeId,
        estadoAtualId: estadoInicial.id,
        status: 'ATIVA',
        dadosJson: dto.dadosJson ?? undefined,
        criadoPor: dto.criadoPor,
      },
      include: { estadoAtual: true, workflow: true },
    });

    await this.prisma.workflowHistorico.create({
      data: {
        instanciaId: data.id,
        estadoDestinoId: estadoInicial.id,
        acao: 'INICIO',
        dadosJson: dto.dadosJson ?? undefined,
        usuarioId: dto.criadoPor,
      },
    });

    this.logger.log(`Instance started: ${data.id} for ${dto.entidadeTipo}:${dto.entidadeId}`);
    return { success: true, data };
  }

  async findAll(query: InstanciaQueryDto) {
    const where: any = {};
    if (query.entidadeTipo) where.entidadeTipo = query.entidadeTipo;
    if (query.entidadeId) where.entidadeId = query.entidadeId;
    if (query.status) where.status = query.status;
    if (query.workflowId) where.workflowId = query.workflowId;

    const data = await this.prisma.workflowInstancia.findMany({
      where,
      include: { estadoAtual: true, workflow: { select: { id: true, nome: true, categoria: true } } },
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflowInstancia.findUnique({
      where: { id },
      include: {
        workflow: { include: { estados: true, transicoes: true } },
        estadoAtual: true,
        tarefas: true,
      },
    });
    if (!data) throw new NotFoundException('Instance not found');
    return { success: true, data };
  }

  async transitar(id: string, dto: TransitarInstanciaDto) {
    const instancia = await this.prisma.workflowInstancia.findUnique({
      where: { id },
      include: { estadoAtual: true, workflow: true },
    });
    if (!instancia) throw new NotFoundException('Instance not found');
    if (instancia.status !== 'ATIVA') throw new BadRequestException('Instance is not active');

    const transicao = await this.prisma.workflowTransicao.findUnique({
      where: { id: dto.transicaoId },
      include: { estadoDestino: true },
    });
    if (!transicao) throw new NotFoundException('Transition not found');
    if (transicao.workflowId !== instancia.workflowId)
      throw new BadRequestException('Transition does not belong to this instance workflow');
    if (transicao.estadoOrigemId !== instancia.estadoAtualId)
      throw new BadRequestException('Transition is not valid for current state');

    const mergedData = { ...((instancia.dadosJson as Record<string, any>) || {}), ...(dto.dadosJson || {}) };

    if (transicao.condicaoJson) {
      const isValid = this.evaluateCondition(transicao.condicaoJson as Record<string, any>, mergedData);
      if (!isValid) throw new BadRequestException('Transition condition not met');
    }

    const updated = await this.prisma.workflowInstancia.update({
      where: { id },
      data: {
        estadoAtualId: transicao.estadoDestinoId,
        dadosJson: mergedData,
      },
    });

    await this.prisma.workflowHistorico.create({
      data: {
        instanciaId: id,
        estadoOrigemId: instancia.estadoAtualId,
        estadoDestinoId: transicao.estadoDestinoId,
        acao: transicao.nome,
        transicaoId: transicao.id,
        dadosJson: dto.dadosJson ?? undefined,
        usuarioId: dto.usuarioId,
      },
    });

    if (transicao.acaoJson) {
      await this.executeActions(transicao.acaoJson as Record<string, any>, {
        instanciaId: id,
        dados: mergedData,
        usuarioId: dto.usuarioId,
      });
    }

    if (transicao.estadoDestino.tipo === 'FINAL') {
      await this.prisma.workflowInstancia.update({
        where: { id },
        data: { status: 'COMPLETA', concluidoEm: new Date() },
      });
      this.logger.log(`Instance ${id} completed at final state`);
    }

    this.logger.log(`Instance ${id} transitioned: ${instancia.estadoAtual?.nome} -> ${transicao.estadoDestino.nome}`);
    return { success: true, data: updated };
  }

  async cancelar(id: string, dto: CancelarInstanciaDto) {
    const instancia = await this.prisma.workflowInstancia.findUnique({ where: { id } });
    if (!instancia) throw new NotFoundException('Instance not found');
    if (instancia.status !== 'ATIVA') throw new BadRequestException('Instance is not active');

    const data = await this.prisma.workflowInstancia.update({
      where: { id },
      data: { status: 'CANCELADA', concluidoEm: new Date() },
    });

    await this.prisma.workflowHistorico.create({
      data: {
        instanciaId: id,
        estadoOrigemId: instancia.estadoAtualId,
        acao: 'CANCELAMENTO',
        dadosJson: dto.motivo ? { motivo: dto.motivo } : undefined,
        usuarioId: dto.usuarioId,
      },
    });

    this.logger.log(`Instance ${id} cancelled`);
    return { success: true, data };
  }

  async getHistorico(id: string) {
    const instancia = await this.prisma.workflowInstancia.findUnique({ where: { id } });
    if (!instancia) throw new NotFoundException('Instance not found');

    const data = await this.prisma.workflowHistorico.findMany({
      where: { instanciaId: id },
      include: {
        estadoOrigem: true,
        estadoDestino: true,
        transicao: true,
      },
      orderBy: { criadoEm: 'asc' },
    });
    return { success: true, data };
  }

  private async executeActions(
    acaoJson: Record<string, any>,
    context: { instanciaId: string; dados: Record<string, any>; usuarioId?: string },
  ) {
    const actions = Array.isArray(acaoJson) ? acaoJson : [acaoJson];

    for (const action of actions) {
      try {
        switch (action.tipo) {
          case 'NOTIFICACAO':
            await this.execNotificacao(action.config, context);
            break;
          case 'ATUALIZACAO_CAMPO':
            await this.execAtualizacaoCampo(action.config, context);
            break;
          case 'API_CALL':
            await this.execApiCall(action.config, context);
            break;
          case 'EMAIL':
            await this.execEmail(action.config, context);
            break;
          case 'CRIAR_TAREFA':
            await this.execCriarTarefa(action.config, context);
            break;
          case 'AGENDAR':
            this.logger.log(`Scheduling action not yet implemented: ${JSON.stringify(action.config)}`);
            break;
          default:
            this.logger.warn(`Unknown action type: ${action.tipo}`);
        }
      } catch (err) {
        this.logger.error(`Action execution error: ${err.message}`, err.stack);
      }
    }
  }

  private async execNotificacao(config: any, context: { instanciaId: string; dados: Record<string, any> }) {
    await this.prisma.workflowHistorico.create({
      data: {
        instanciaId: context.instanciaId,
        acao: 'NOTIFICACAO',
        dadosJson: { mensagem: config.mensagem, destino: config.destino },
      },
    });
    this.logger.log(`Notification: ${config.mensagem} -> ${config.destino}`);
  }

  private async execAtualizacaoCampo(config: any, context: { instanciaId: string; dados: Record<string, any> }) {
    if (config.campo && config.valor !== undefined) {
      context.dados[config.campo] = config.valor;

      await this.prisma.workflowInstancia.update({
        where: { id: context.instanciaId },
        data: { dadosJson: context.dados },
      });
      this.logger.log(`Field updated: ${config.campo} = ${config.valor}`);
    }
  }

  private async execApiCall(config: any, _context: { instanciaId: string; dados: Record<string, any> }) {
    if (config.url) {
      this.logger.log(`API Call: POST ${config.url} - integration not yet wired`);
    }
  }

  private async execEmail(config: any, _context: { instanciaId: string; dados: Record<string, any> }) {
    if (config.destino && config.template) {
      this.logger.log(`Email: ${config.template} -> ${config.destino}`);
    }
  }

  private async execCriarTarefa(config: any, context: { instanciaId: string; dados: Record<string, any>; usuarioId?: string }) {
    await this.prisma.workflowTarefa.create({
      data: {
        instanciaId: context.instanciaId,
        usuarioId: config.usuarioId || context.usuarioId,
        titulo: config.titulo || 'Tarefa pendente',
        descricao: config.descricao,
        dataLimite: config.dataLimite ? new Date(config.dataLimite) : undefined,
      },
    });
    this.logger.log(`Task created: ${config.titulo}`);
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
