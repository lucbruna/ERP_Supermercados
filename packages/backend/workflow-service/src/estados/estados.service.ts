import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEstadoDto, UpdateEstadoDto } from './dto/estado.dto';

@Injectable()
export class EstadosService {
  private readonly logger = new Logger(EstadosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(workflowId: string, dto: CreateEstadoDto) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    const data = await this.prisma.workflowEstado.create({
      data: {
        workflowId,
        nome: dto.nome,
        tipo: dto.tipo,
        ordem: dto.ordem ?? 0,
        configJson: dto.configJson ?? undefined,
      },
    });
    this.logger.log(`Estado created: ${data.nome} (${data.id}) for workflow ${workflowId}`);
    return { success: true, data };
  }

  async findAll(workflowId: string) {
    const data = await this.prisma.workflowEstado.findMany({
      where: { workflowId },
      orderBy: { ordem: 'asc' },
    });
    return { success: true, data };
  }

  async findOne(id: string) {
    const data = await this.prisma.workflowEstado.findUnique({
      where: { id },
      include: {
        estadoOrigem: true,
        estadoDestino: true,
      },
    });
    if (!data) throw new NotFoundException('Estado not found');
    return { success: true, data };
  }

  async update(id: string, dto: UpdateEstadoDto) {
    await this.findOne(id);
    const data = await this.prisma.workflowEstado.update({ where: { id }, data: dto });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workflowEstado.delete({ where: { id } });
    return { success: true, data: { message: 'Estado deleted' } };
  }
}
