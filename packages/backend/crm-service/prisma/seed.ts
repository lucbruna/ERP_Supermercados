import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'empresa-demo-001';

  const segmentos = await Promise.all([
    prisma.grupoCliente.create({
      data: {
        companyId,
        nome: 'Alto Ticket',
        criterios: [
          { campo: 'totalCompras', operador: 'gte', valor: 50000 },
        ],
      },
    }),
    prisma.grupoCliente.create({
      data: {
        companyId,
        nome: 'Novos Clientes',
        criterios: [
          { campo: 'segmento', operador: 'eq', valor: 'POTENCIAL' },
        ],
      },
    }),
  ]);

  const programaCashback = await prisma.fidelidadePrograma.create({
    data: {
      companyId,
      nome: 'Cashback Fiel',
      tipo: 'CASHBACK',
      regras: [
        { tipo: 'PERCENTUAL', percentual: 5, valorMinimoCompra: 50 },
        { tipo: 'TABELA_PROGRESSIVA', faixas: [
          { minimo: 0, maximo: 100, percentual: 2 },
          { minimo: 101, maximo: 500, percentual: 5 },
          { minimo: 501, maximo: 99999, percentual: 8 },
        ]},
      ],
      ativo: true,
    },
  });

  const programaPontos = await prisma.fidelidadePrograma.create({
    data: {
      companyId,
      nome: 'Points Club',
      tipo: 'PONTOS',
      regras: [
        { tipo: 'FIXO_POR_VALOR', pontosPorReal: 10 },
        { tipo: 'MULTIPLICADOR', multiplicador: 15, categoriaProduto: 'PERECIVEIS' },
      ],
      ativo: true,
    },
  });

  const cliente = await prisma.cliente.create({
    data: {
      companyId,
      nome: 'João Silva',
      cpfCnpj: '12345678901',
      email: 'joao@email.com',
      celular: '11999999999',
      endereco: { logradouro: 'Rua Exemplo', numero: '100', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP' },
      segmento: 'REGULAR',
      preferencias: ['OFERTAS', 'PROMOCOES'],
      ativo: true,
    },
  });

  await prisma.enderecoCliente.create({
    data: {
      clienteId: cliente.id,
      tipo: 'ENTREGA',
      cep: '01001000',
      logradouro: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      principal: true,
    },
  });

  const cupom = await prisma.cupom.create({
    data: {
      companyId,
      codigo: 'BEMVINDO10',
      tipo: 'PERCENTUAL',
      valor: 10,
      dataInicio: new Date(),
      dataFim: new Date('2026-12-31'),
      usoLimite: 100,
      ativo: true,
    },
  });

  console.log('Seed completed successfully');
  console.log({ companyId, clienteId: cliente.id, cupomId: cupom.id, programas: [programaCashback.id, programaPontos.id] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
