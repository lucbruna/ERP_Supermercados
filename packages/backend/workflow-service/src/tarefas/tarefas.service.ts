import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTarefaDto, TarefaQueryDto } from './dto/tarefa.dto';

@Injectable()
export class TarefasService {
  private readonly logger = new Logger(TarefasService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTarefaDto) {
    const instancia = await this.prisma.workflowInstancia.findUnique({ where: { id: dto.instanciaId } });
    if (!instancia) throw new NotFoundException('Instance not found');

    const data = await this.prisma.workflowTarefa.create({
      data: {
        instanciaId: dto.instanciaId,
        usuarioId: dto.usuarioId,
        titulo: dto.titulo,
        descricao: dto.descricao,
        dataLimite: dto.dataLimite ? new Date(dto.dataLimite) : undefined,
      },
    });
    this.logger.log(`Tarefa created: ${data.titulo} (${data.id})`);
    return { success: true, data };
  }

  async findAll(query: TarefaQueryDto) {
    const where: any = {};
    if (query.usuarioId) where.usuarioId = query.usuarioId;
    if (query.status) where.status = query.status;
    if (query.instanciaId) where.instanciaId = query.instanciaId;

    const data = await this.prisma.workflowTarefa.findMany({
      where,
      include: { instancia: { select: { id: true, entidadeTipo: true, entidadeId: true } } },
      orderBy: [{ status: 'asc' }, { dataLimite: 'asc' }],
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflowTarefa.findUnique({
      where: { id },
      include: { instancia: true },
    });
    if (!data) throw new NotFoundException('Tarefa not found');
    return { success: true, data };
  }

  async concluir(id: string) {
    const tarefa = await this.findOne(id);
    if (tarefa.data.status === 'COMPLETA') {
      return { success: true, data: { message: 'Task already completed' } };
    }

    const data = await this.prisma.workflowTarefa.update({
      where: { id },
      data: { status: 'COMPLETA', concluidoEm: new Date() },
    });
    this.logger.log(`Tarefa completed: ${data.titulo} (${data.id})`);
    return { success: true, data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workflowTarefa.delete({ where: { id } });
    return { success: true, data: { message: 'Tarefa deleted' } };
  }
}
