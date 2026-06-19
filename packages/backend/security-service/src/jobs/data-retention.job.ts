import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma.service';
import { AnonymizationService } from '../anonymization/anonymization.service';

@Injectable()
export class DataRetentionJob {
  private readonly logger = new Logger(DataRetentionJob.name);

  constructor(
    private prisma: PrismaService,
    private anonymization: AnonymizationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDataRetention() {
    this.logger.log('Iniciando job de retenção de dados LGPD...');

    try {
      await this.autoAnonymizeOldData();
      await this.autoEliminateOldSolicitacoes();
      this.logger.log('Job de retenção de dados concluído com sucesso');
    } catch (error) {
      this.logger.error('Erro no job de retenção de dados', error);
    }
  }

  private async autoAnonymizeOldData() {
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() - 5);

    const oldData = await this.prisma.dadosPessoais.findMany({
      where: { criadoEm: { lt: retentionDate } },
    });

    for (const data of oldData) {
      await this.prisma.dadosPessoais.update({
        where: { id: data.id },
        data: {
          hash: this.anonymization.anonymizeName('ANONYMIZED_DATA'),
          finalidade: 'ANONYMIZED_AUTO_RETENTION',
        },
      });
    }

    if (oldData.length > 0) {
      this.logger.log(`Anonimizados ${oldData.length} registros de dados por retenção`);
    }
  }

  private async autoEliminateOldSolicitacoes() {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);

    const oldSolicitacoes = await this.prisma.solicitacaoTitular.findMany({
      where: { criadoEm: { lt: cutoffDate } },
    });

    for (const sol of oldSolicitacoes) {
      await this.prisma.solicitacaoTitular.update({
        where: { id: sol.id },
        data: {
          dadosRelacionados: null,
          resposta: null,
          descricao: '[DADOS ELIMINADOS POR RETENÇÃO LGPD]',
        },
      });
    }

    if (oldSolicitacoes.length > 0) {
      this.logger.log(`Eliminados dados de ${oldSolicitacoes.length} solicitações antigas`);
    }
  }
}
