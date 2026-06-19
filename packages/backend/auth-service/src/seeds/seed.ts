import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const existingCompany = await prisma.company.findUnique({
    where: { cnpj: '00.000.000/0001-91' },
  });

  if (existingCompany) {
    console.log('Seed já foi executado. Pulando...');
    return;
  }

  const company = await prisma.company.create({
    data: {
      cnpj: '00.000.000/0001-91',
      razaoSocial: 'Supermercado Modelo S.A.',
      nomeFantasia: 'SuperModelo',
      inscricaoEstadual: '123.456.789.000',
      regimeTributario: 'LUCRO_PRESUMIDO',
    },
  });
  console.log(`Empresa criada: ${company.nomeFantasia}`);

  const unidade = await prisma.unidade.create({
    data: {
      companyId: company.id,
      tipo: 'LOJA',
      cnpj: '00.000.000/0001-91',
      nome: 'Matriz Centro',
    },
  });
  console.log(`Unidade criada: ${unidade.nome}`);

  const salt = await bcrypt.genSalt(12);
  const senha = await bcrypt.hash('admin@123', salt);

  const adminMaster = await prisma.user.create({
    data: {
      companyId: company.id,
      unidadeId: unidade.id,
      nome: 'Administrador Master',
      cpf: '000.000.000-00',
      email: 'admin@supermercado.com.br',
      celular: '(11) 99999-9999',
      perfil: 'ADMIN_MASTER',
      departamento: 'ADMINISTRACAO',
      cargo: 'Administrador Master',
      senha,
      salt,
    },
  });
  console.log(`Admin criado: ${adminMaster.email} / senha: admin@123`);

  const permissions = [
    { perfil: 'ADMIN_MASTER', departamento: 'ADMINISTRACAO', recurso: '*', acao: 'TODOS' },
    { perfil: 'DIRETORIA', departamento: 'ADMINISTRACAO', recurso: '*', acao: 'TODOS' },
    { perfil: 'RH', departamento: 'RH', recurso: 'funcionarios', acao: 'TODOS' },
    { perfil: 'RH', departamento: 'RH', recurso: 'folha-pagamento', acao: 'TODOS' },
    { perfil: 'RH', departamento: 'RH', recurso: 'ponto', acao: 'TODOS' },
    { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'contas-pagar', acao: 'TODOS' },
    { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'contas-receber', acao: 'TODOS' },
    { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'fluxo-caixa', acao: 'TODOS' },
    { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'bancos', acao: 'TODOS' },
    { perfil: 'FINANCEIRO', departamento: 'FINANCEIRO', recurso: 'conciliacao', acao: 'TODOS' },
    { perfil: 'CAIXA', departamento: 'PDV', recurso: 'pdv-venda', acao: 'TODOS' },
    { perfil: 'CAIXA', departamento: 'PDV', recurso: 'consulta-preco', acao: 'LER' },
    { perfil: 'GERENTE_HORTIFRUTI', departamento: 'HORTIFRUTI', recurso: 'produtos', acao: 'TODOS' },
    { perfil: 'GERENTE_ACOUGUE', departamento: 'ACOUGUE', recurso: 'produtos', acao: 'TODOS' },
    { perfil: 'GERENTE_PADARIA', departamento: 'PADARIA', recurso: 'produtos', acao: 'TODOS' },
  ];

  for (const perm of permissions) {
    await prisma.permission.create({ data: perm });
  }
  console.log(`${permissions.length} permissões criadas`);

  console.log('\n=== SEED COMPLETO ===');
  console.log('Email: admin@supermercado.com.br');
  console.log('Senha: admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
