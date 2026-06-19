import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateIntegracaoDto, UpdateIntegracaoDto, SincronizarDto } from './dto/ecommerce.dto';

@Injectable()
export class EcommerceService {
  private readonly logger = new Logger(EcommerceService.name);
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateIntegracaoDto) {
    return this.prisma.integracaoEcommerce.create({ data: dto });
  }

  async listar(companyId: string) {
    return this.prisma.integracaoEcommerce.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  async obter(id: string) {
    const integracao = await this.prisma.integracaoEcommerce.findUnique({ where: { id } });
    if (!integracao) throw new NotFoundException('Integração não encontrada');
    return integracao;
  }

  async atualizar(id: string, dto: UpdateIntegracaoDto) {
    await this.obter(id);
    return this.prisma.integracaoEcommerce.update({ where: { id }, data: dto });
  }

  async remover(id: string) {
    await this.obter(id);
    return this.prisma.integracaoEcommerce.delete({ where: { id } });
  }

  async sincronizar(id: string, dto: SincronizarDto) {
    await this.obter(id);
    const log = await this.prisma.logSincronizacao.create({
      data: { integracaoId: id, tipo: dto.tipo, direcao: 'EXPORT', status: 'SUCESSO', registros: 0, dataInicio: new Date(), dataFim: new Date() },
    });
    await this.prisma.integracaoEcommerce.update({ where: { id }, data: { ultimaSinc: new Date() } });
    return log;
  }

  async logs(id: string) {
    return this.prisma.logSincronizacao.findMany({ where: { integracaoId: id }, orderBy: { dataInicio: 'desc' }, take: 50 });
  }

  async webhook(plataforma: string, body: any) {
    this.logger.log(`Webhook recebido de ${plataforma}: ${JSON.stringify(body).substring(0, 200)}`);
    return { received: true, plataforma, timestamp: new Date() };
  }
}
