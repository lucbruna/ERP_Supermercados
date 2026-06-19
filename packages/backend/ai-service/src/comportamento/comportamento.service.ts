import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AnalisarComportamentoDto, ComportamentoQueryDto } from '../dto/comportamento.dto';

@Injectable()
export class ComportamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(dto: AnalisarComportamentoDto) {
    const metricas = dto.metricas || [
      { nome: 'frequencia', valor: Math.floor(Math.random() * 30) + 1 },
      { nome: 'ticketMedio', valor: parseFloat((Math.random() * 500 + 50).toFixed(2)) },
      { nome: 'categoriasPreferidas', valor: ['ALIMENTOS', 'BEBIDAS', 'LIMPEZA'] },
      { nome: 'horarioPreferido', valor: `${8 + Math.floor(Math.random() * 12)}:00` },
      { nome: 'diasSemana', valor: ['SEG', 'QUA', 'SEX'] },
    ];

    return this.prisma.analiseComportamento.create({
      data: {
        clienteId: dto.clienteId,
        periodo: dto.periodo,
        metricas,
      },
    });
  }

  async findAll(query: ComportamentoQueryDto) {
    const where: any = {};
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.periodo) where.periodo = query.periodo;
    return this.prisma.analiseComportamento.findMany({
      where,
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.analiseComportamento.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Behavior analysis not found');
    return record;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.analiseComportamento.delete({ where: { id } });
  }
}
