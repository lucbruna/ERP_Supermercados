import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSegmentoDto } from './dto/create-segmento.dto';
import { UpdateSegmentoDto } from './dto/update-segmento.dto';
import { SegmentoCliente } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class SegmentacaoService {
  private readonly logger = new Logger(SegmentacaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSegmentoDto) {
    return this.prisma.grupoCliente.create({ data: dto });
  }

  async findAll(companyId: string) {
    return this.prisma.grupoCliente.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const segmento = await this.prisma.grupoCliente.findUnique({
      where: { id },
      include: { atribuicoes: { include: { cliente: true } } },
    });
    if (!segmento) throw new NotFoundException('Segmento não encontrado');
    return segmento;
  }

  async update(id: string, dto: UpdateSegmentoDto) {
    await this.findById(id);
    return this.prisma.grupoCliente.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.grupoCliente.delete({ where: { id } });
  }

  async classificarCliente(clienteId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { grupos: true },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    const totalCompras = Number(cliente.totalCompras);
    const ultimaCompra = cliente.ultimaCompra;
    const diasDesdeUltimaCompra = ultimaCompra
      ? Math.floor((Date.now() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let novoSegmento: SegmentoCliente;

    if (diasDesdeUltimaCompra > 365) {
      novoSegmento = 'PERDIDO';
    } else if (diasDesdeUltimaCompra > 180) {
      novoSegmento = 'INATIVO';
    } else if (totalCompras >= 50000) {
      novoSegmento = 'VIP';
    } else if (totalCompras >= 10000) {
      novoSegmento = 'FREQUENTE';
    } else if (totalCompras >= 1000) {
      novoSegmento = 'REGULAR';
    } else {
      novoSegmento = 'POTENCIAL';
    }

    await this.prisma.cliente.update({
      where: { id: clienteId },
      data: { segmento: novoSegmento },
    });

    const segmentos = await this.prisma.grupoCliente.findMany({ where: { companyId: cliente.companyId } });
    for (const seg of segmentos) {
      const matched = this.avaliarCriterios(cliente, seg.criterios as any[]);
      if (matched) {
        await this.prisma.clienteGrupo.upsert({
          where: { clienteId_grupoId: { clienteId, grupoId: seg.id } },
          create: { clienteId, grupoId: seg.id },
          update: { dataAtribuicao: new Date() },
        });
      } else {
        await this.prisma.clienteGrupo.deleteMany({
          where: { clienteId, grupoId: seg.id },
        });
      }
    }

    return { clienteId, segmento: novoSegmento };
  }

  async classificarEmMassa(companyId: string) {
    const clientes = await this.prisma.cliente.findMany({ where: { companyId, ativo: true } });
    const resultados = [];
    for (const cliente of clientes) {
      const result = await this.classificarCliente(cliente.id);
      resultados.push(result);
    }
    return resultados;
  }

  private avaliarCriterios(cliente: any, criterios: any[]): boolean {
    return criterios.every((criterio) => {
      const { campo, operador, valor } = criterio;
      const valorCampo = cliente[campo];
      switch (operador) {
        case 'gte': return Number(valorCampo) >= Number(valor);
        case 'lte': return Number(valorCampo) <= Number(valor);
        case 'eq': return valorCampo === valor;
        case 'contains': return String(valorCampo).includes(String(valor));
        case 'gt': return Number(valorCampo) > Number(valor);
        case 'lt': return Number(valorCampo) < Number(valor);
        default: return false;
      }
    });
  }
}
