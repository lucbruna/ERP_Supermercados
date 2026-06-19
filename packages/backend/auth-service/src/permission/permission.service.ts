import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { perfil: string; departamento: string; recurso: string; acao: string }) {
    const permission = await this.prisma.permission.create({ data });
    return { success: true, permission };
  }

  async findAll(query: { perfil?: string; departamento?: string }) {
    const where: any = {};
    if (query.perfil) where.perfil = query.perfil;
    if (query.departamento) where.departamento = query.departamento;

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: [{ perfil: 'asc' }, { recurso: 'asc' }],
    });

    return { success: true, data: permissions };
  }

  async remove(id: string) {
    await this.prisma.permission.delete({ where: { id } });
    return { success: true, message: 'Permissão removida' };
  }

  async seedDefaultPermissions() {
    const defaultPermissions = [
      // ADMIN MASTER - acesso total
      { perfil: 'ADMIN_MASTER', departamento: 'ADMINISTRACAO', recurso: '*', acao: 'TODOS' },
      { perfil: 'DIRETORIA', departamento: 'ADMINISTRACAO', recurso: '*', acao: 'TODOS' },

      // RH
      { perfil: 'RH', departamento: 'RH', recurso: 'funcionarios', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'folha-pagamento', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'ferias', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'escalas', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'beneficios', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'banco-horas', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'recrutamento', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'treinamentos', acao: 'TODOS' },
      { perfil: 'RH', departamento: 'RH', recurso: 'ponto', acao: 'TODOS' },

      // FINANCEIRO
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'contas-pagar', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'contas-receber', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'fluxo-caixa', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'bancos', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'conciliacao', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'pix', acao: 'TODOS' },
      { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'relatorios-financeiros', acao: 'TODOS' },

      // CAIXA / PDV
      { perfil: 'CAIXA', departamento: 'PDV', recurso: 'pdv-venda', acao: 'TODOS' },
      { perfil: 'CAIXA', departamento: 'PDV', recurso: 'consulta-preco', acao: 'LER' },
      { perfil: 'CAIXA', departamento: 'PDV', recurso: 'troca', acao: 'CRIAR' },
      { perfil: 'CAIXA', departamento: 'PDV', recurso: 'cancelamento', acao: 'CRIAR' },

      // GERENTE HORTIFRUTI
      { perfil: 'GERENTE_HORTIFRUTI', departamento: 'HORTIFRUTI', recurso: 'produtos', acao: 'TODOS' },
      { perfil: 'GERENTE_HORTIFRUTI', departamento: 'HORTIFRUTI', recurso: 'estoque', acao: 'TODOS' },
      { perfil: 'GERENTE_HORTIFRUTI', departamento: 'HORTIFRUTI', recurso: 'vendas-setor', acao: 'LER' },
      { perfil: 'GERENTE_HORTIFRUTI', departamento: 'HORTIFRUTI', recurso: 'funcionarios-setor', acao: 'LER' },

      // GERENTE ACOUGUE
      { perfil: 'GERENTE_ACOUGUE', departamento: 'ACOUGUE', recurso: 'produtos', acao: 'TODOS' },
      { perfil: 'GERENTE_ACOUGUE', departamento: 'ACOUGUE', recurso: 'estoque', acao: 'TODOS' },
      { perfil: 'GERENTE_ACOUGUE', departamento: 'ACOUGUE', recurso: 'vendas-setor', acao: 'LER' },

      // GERENTE PADARIA
      { perfil: 'GERENTE_PADARIA', departamento: 'PADARIA', recurso: 'produtos', acao: 'TODOS' },
      { perfil: 'GERENTE_PADARIA', departamento: 'PADARIA', recurso: 'estoque', acao: 'TODOS' },
      { perfil: 'GERENTE_PADARIA', departamento: 'PADARIA', recurso: 'vendas-setor', acao: 'LER' },
    ];

    for (const perm of defaultPermissions) {
      const exists = await this.prisma.permission.findFirst({
        where: { perfil: perm.perfil, departamento: perm.departamento, recurso: perm.recurso },
      });
      if (!exists) {
        await this.prisma.permission.create({ data: perm });
        this.logger.log(`Permission created: ${perm.perfil} - ${perm.recurso}`);
      }
    }

    return { success: true, message: 'Permissões padrão criadas' };
  }
}
