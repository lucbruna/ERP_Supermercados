import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAcaoDto, UpdateAcaoDto, ExecutarAcaoDto } from './dto/acao.dto';

@Injectable()
export class AcoesService {
  private readonly logger = new Logger(AcoesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcaoDto) {
    const data = await this.prisma.workflowAcao.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        tipo: dto.tipo,
        configJson: dto.configJson ?? undefined,
        ativo: dto.ativo ?? true,
      },
    });
    this.logger.log(`Acao created: ${data.nome} (${data.id})`);
    return { success: true, data };
  }

  async findAll() {
    const data = await this.prisma.workflowAcao.findMany({
      orderBy: { criadoEm: 'desc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflowAcao.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Acao not found');
    return { success: true, data };
  }

  async update(id: string, dto: UpdateAcaoDto) {
    await this.findOne(id);
    const data = await this.prisma.workflowAcao.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workflowAcao.delete({ where: { id } });
    return { success: true, data: { message: 'Acao deleted' } };
  }

  async executar(id: string, dto: ExecutarAcaoDto) {
    const acao = await this.findOne(id);

    this.logger.log(`Executing action ${acao.data.nome} with params: ${JSON.stringify(dto.params)}`);

    const actionConfig = acao.data.configJson as Record<string, any> || {};
    const params = dto.params || {};

    switch (acao.data.tipo) {
      case 'NOTIFICACAO':
        this.logger.log(`Notification: ${params.mensagem || actionConfig.mensagem}`);
        break;
      case 'ATUALIZACAO_CAMPO':
        if (dto.instanciaId) {
          const campo = params.campo || actionConfig.campo;
          const valor = params.valor !== undefined ? params.valor : actionConfig.valor;
          if (campo && valor !== undefined) {
            const instancia = await this.prisma.workflowInstancia.findUnique({ where: { id: dto.instanciaId } });
            if (instancia) {
              const dados = (instancia.dadosJson as Record<string, any>) || {};
              dados[campo] = valor;
              await this.prisma.workflowInstancia.update({
                where: { id: dto.instanciaId },
                data: { dadosJson: dados },
              });
            }
          }
        }
        break;
      case 'API_CALL':
        this.logger.log(`API Call: ${actionConfig.url || params.url}`);
        break;
      case 'EMAIL':
        this.logger.log(`Email: ${actionConfig.template || params.template} -> ${actionConfig.destino || params.destino}`);
        break;
      case 'CRIAR_TAREFA':
        if (dto.instanciaId) {
          await this.prisma.workflowTarefa.create({
            data: {
              instanciaId: dto.instanciaId,
              usuarioId: params.usuarioId || actionConfig.usuarioId,
              titulo: params.titulo || actionConfig.titulo || 'Tarefa',
              descricao: params.descricao || actionConfig.descricao,
              dataLimite: params.dataLimite ? new Date(params.dataLimite) : undefined,
            },
          });
        }
        break;
      case 'AGENDAR':
        this.logger.log(`Schedule: ${JSON.stringify(actionConfig)}`);
        break;
    }

    return { success: true, data: { message: 'Action executed', action: acao.data.nome } };
  }
}
