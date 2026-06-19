import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { IniciarSessaoDto, RegistrarLeituraDto } from './dto/coletor.dto';

@Injectable()
export class ColetorService {
  private readonly logger = new Logger(ColetorService.name);
  constructor(private readonly prisma: PrismaService) {}

  async iniciarSessao(dto: IniciarSessaoDto) {
    return this.prisma.sessaoColetor.create({ data: { ...dto, status: 'ABERTA', inicio: new Date() } });
  }

  async registrarLeitura(dto: RegistrarLeituraDto) {
    const sessao = await this.prisma.sessaoColetor.findUnique({ where: { id: dto.sessaoId } });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    if (sessao.status !== 'ABERTA') throw new NotFoundException('Sessão já encerrada');

    const leitura = await this.prisma.leituraColetor.create({
      data: {
        sessaoId: dto.sessaoId,
        produtoId: dto.produtoId,
        codigoBarras: dto.codigoBarras,
        quantidade: dto.quantidade ?? 1,
        localizacao: dto.localizacao,
        lote: dto.lote,
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
      },
    });

    await this.prisma.sessaoColetor.update({
      where: { id: dto.sessaoId },
      data: { totalLidos: { increment: 1 } },
    });

    return leitura;
  }

  async encerrarSessao(id: string) {
    const sessao = await this.prisma.sessaoColetor.findUnique({ where: { id } });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    return this.prisma.sessaoColetor.update({ where: { id }, data: { status: 'FECHADA', fim: new Date() } });
  }

  async listarSessoes(companyId: string) {
    return this.prisma.sessaoColetor.findMany({
      where: { companyId },
      orderBy: { inicio: 'desc' },
      take: 50,
    });
  }

  async obterSessao(id: string) {
    const sessao = await this.prisma.sessaoColetor.findUnique({
      where: { id },
      include: { leituras: { orderBy: { dataHora: 'desc' } } },
    });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    return sessao;
  }
}
