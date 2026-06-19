import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed da Frota...');

  // Limpar dados existentes
  await prisma.kmRegistro.deleteMany();
  await prisma.rota.deleteMany();
  await prisma.multa.deleteMany();
  await prisma.contratoVeiculo.deleteMany();
  await prisma.manutencao.deleteMany();
  await prisma.abastecimento.deleteMany();
  await prisma.motorista.deleteMany();
  await prisma.veiculo.deleteMany();

  // Veículos
  const veiculos = await Promise.all([
    prisma.veiculo.create({
      data: {
        placa: 'ABC-1234',
        renavam: '12345678901',
        chassi: '9BWZZZ377VT004251',
        marca: 'Fiat',
        modelo: 'Fiorino',
        anoFabricacao: 2022,
        anoModelo: 2023,
        cor: 'Branco',
        tipo: 'UTILITARIO',
        categoria: 'Leve',
        capacidadeCarga: 650,
        capacidadeTanque: 48,
        combustivel: 'FLEX',
        kmAtual: 45320,
        situacao: 'ATIVO',
        observacoes: 'Veículo principal de entregas urbanas',
      },
    }),
    prisma.veiculo.create({
      data: {
        placa: 'DEF-5678',
        renavam: '98765432109',
        chassi: '9BWZZZ377VT004252',
        marca: 'Volkswagen',
        modelo: 'Delivery 11.180',
        anoFabricacao: 2021,
        anoModelo: 2022,
        cor: 'Azul',
        tipo: 'CAMINHAO',
        categoria: 'Médio',
        capacidadeCarga: 5000,
        capacidadeTanque: 150,
        combustivel: 'DIESEL',
        kmAtual: 98750,
        situacao: 'ATIVO',
        observacoes: 'Distribuição intermunicipal',
      },
    }),
    prisma.veiculo.create({
      data: {
        placa: 'GHI-9012',
        renavam: '45678901234',
        chassi: '9BWZZZ377VT004253',
        marca: 'Toyota',
        modelo: 'Hilux CD 4x4',
        anoFabricacao: 2023,
        anoModelo: 2024,
        cor: 'Prata',
        tipo: 'PASSEIO',
        categoria: 'Pickup',
        capacidadeCarga: 1000,
        capacidadeTanque: 80,
        combustivel: 'DIESEL',
        kmAtual: 22150,
        situacao: 'ATIVO',
        observacoes: 'Veículo de supervisão e gerência',
      },
    }),
    prisma.veiculo.create({
      data: {
        placa: 'JKL-3456',
        renavam: '56789012345',
        chassi: '9BWZZZ377VT004254',
        marca: 'Mercedes-Benz',
        modelo: 'Sprinter 516',
        anoFabricacao: 2022,
        anoModelo: 2022,
        cor: 'Branco',
        tipo: 'VAN',
        categoria: 'Furgão',
        capacidadeCarga: 1500,
        capacidadeTanque: 100,
        combustivel: 'DIESEL',
        kmAtual: 67500,
        situacao: 'MANUTENCAO',
        observacoes: 'Em manutenção preventiva programada',
      },
    }),
    prisma.veiculo.create({
      data: {
        placa: 'MNO-7890',
        renavam: '67890123456',
        chassi: '9BWZZZ377VT004255',
        marca: 'Fiat',
        modelo: 'Doblo Cargo',
        anoFabricacao: 2020,
        anoModelo: 2021,
        cor: 'Vermelho',
        tipo: 'CARGA',
        categoria: 'Leve',
        capacidadeCarga: 620,
        capacidadeTanque: 55,
        combustivel: 'FLEX',
        kmAtual: 112300,
        situacao: 'INATIVO',
        observacoes: 'Aguardando avaliação para baixa',
      },
    }),
  ]);

  console.log(`✅ ${veiculos.length} veículos criados`);

  // Motoristas
  const motoristas = await Promise.all([
    prisma.motorista.create({
      data: {
        nome: 'Carlos Alberto Santos',
        cpf: '111.222.333-44',
        cnh: '12345678901',
        categoriaCnh: 'D',
        validadeCnh: new Date('2027-05-15'),
        dataExame: new Date('2024-05-15'),
        telefone: '(11) 99999-0001',
        email: 'carlos.santos@email.com',
        situacao: 'ATIVO',
      },
    }),
    prisma.motorista.create({
      data: {
        nome: 'Maria Aparecida Lima',
        cpf: '222.333.444-55',
        cnh: '23456789012',
        categoriaCnh: 'E',
        validadeCnh: new Date('2026-08-20'),
        dataExame: new Date('2024-08-20'),
        telefone: '(11) 99999-0002',
        email: 'maria.lima@email.com',
        situacao: 'ATIVO',
      },
    }),
    prisma.motorista.create({
      data: {
        nome: 'João Paulo Oliveira',
        cpf: '333.444.555-66',
        cnh: '34567890123',
        categoriaCnh: 'B',
        validadeCnh: new Date('2028-01-10'),
        dataExame: new Date('2025-01-10'),
        telefone: '(11) 99999-0003',
        email: 'joao.oliveira@email.com',
        situacao: 'FERIAS',
      },
    }),
    prisma.motorista.create({
      data: {
        nome: 'Ana Beatriz Costa',
        cpf: '444.555.666-77',
        cnh: '45678901234',
        categoriaCnh: 'D',
        validadeCnh: new Date('2026-11-30'),
        dataExame: new Date('2024-11-30'),
        telefone: '(11) 99999-0004',
        email: 'ana.costa@email.com',
        situacao: 'ATIVO',
      },
    }),
    prisma.motorista.create({
      data: {
        nome: 'Pedro Henrique Souza',
        cpf: '555.666.777-88',
        cnh: '56789012345',
        categoriaCnh: 'C',
        validadeCnh: new Date('2027-03-05'),
        dataExame: new Date('2025-03-05'),
        telefone: '(11) 99999-0005',
        email: 'pedro.souza@email.com',
        situacao: 'INATIVO',
      },
    }),
  ]);

  console.log(`✅ ${motoristas.length} motoristas criados`);

  // Abastecimentos
  const abastecimentos = await Promise.all([
    prisma.abastecimento.create({
      data: {
        veiculoId: veiculos[0].id,
        motoristaId: motoristas[0].id,
        data: new Date('2026-06-15'),
        litros: 45.5,
        valorLitro: 6.39,
        valorTotal: 290.75,
        kmAtual: 45000,
        tipoCombustivel: 'FLEX',
        posto: 'Posto Shell - Centro',
        notaFiscal: 'NF-12345',
      },
    }),
    prisma.abastecimento.create({
      data: {
        veiculoId: veiculos[0].id,
        motoristaId: motoristas[0].id,
        data: new Date('2026-06-10'),
        litros: 42.0,
        valorLitro: 6.29,
        valorTotal: 264.18,
        kmAtual: 44750,
        tipoCombustivel: 'FLEX',
        posto: 'Posto Ipiranga - Vila Maria',
      },
    }),
    prisma.abastecimento.create({
      data: {
        veiculoId: veiculos[1].id,
        motoristaId: motoristas[1].id,
        data: new Date('2026-06-14'),
        litros: 120.0,
        valorLitro: 5.89,
        valorTotal: 706.80,
        kmAtual: 98500,
        tipoCombustivel: 'DIESEL',
        posto: 'Posto BR - Rodovia',
        notaFiscal: 'NF-12346',
      },
    }),
    prisma.abastecimento.create({
      data: {
        veiculoId: veiculos[2].id,
        motoristaId: motoristas[3].id,
        data: new Date('2026-06-12'),
        litros: 60.0,
        valorLitro: 5.89,
        valorTotal: 353.40,
        kmAtual: 22000,
        tipoCombustivel: 'DIESEL',
        posto: 'Posto Shell - Rodovia',
      },
    }),
    prisma.abastecimento.create({
      data: {
        veiculoId: veiculos[1].id,
        motoristaId: motoristas[1].id,
        data: new Date('2026-06-05'),
        litros: 130.0,
        valorLitro: 5.79,
        valorTotal: 752.70,
        kmAtual: 97900,
        tipoCombustivel: 'DIESEL',
        posto: 'Posto BR - Rodovia',
        notaFiscal: 'NF-12340',
      },
    }),
  ]);

  console.log(`✅ ${abastecimentos.length} abastecimentos criados`);

  // Manutenções
  const manutencoes = await Promise.all([
    prisma.manutencao.create({
      data: {
        veiculoId: veiculos[0].id,
        data: new Date('2026-06-01'),
        tipo: 'PREVENTIVA',
        descricao: 'Troca de óleo e filtros - Revisão 40.000 km',
        kmAtual: 42000,
        valorPecas: 320.00,
        valorMaoObra: 150.00,
        valorTotal: 470.00,
        oficina: 'Auto Mecânica Centro',
        notaFiscal: 'NF-MAN-001',
        dataProximaManutencao: new Date('2026-09-01'),
        status: 'CONCLUIDA',
        observacoes: 'Óleo sintético 5W30',
      },
    }),
    prisma.manutencao.create({
      data: {
        veiculoId: veiculos[1].id,
        data: new Date('2026-05-20'),
        tipo: 'CORRETIVA',
        descricao: 'Troca de pastilhas de freio dianteiras',
        kmAtual: 97000,
        valorPecas: 450.00,
        valorMaoObra: 200.00,
        valorTotal: 650.00,
        oficina: 'Freios & Cia',
        notaFiscal: 'NF-MAN-002',
        status: 'CONCLUIDA',
      },
    }),
    prisma.manutencao.create({
      data: {
        veiculoId: veiculos[3].id,
        data: new Date('2026-06-18'),
        tipo: 'REVISAO',
        descricao: 'Revisão geral programada 60.000 km',
        kmAtual: 67500,
        valorPecas: 1850.00,
        valorMaoObra: 600.00,
        valorTotal: 2450.00,
        oficina: 'Mercedes-Benz Autorizada',
        dataProximaManutencao: new Date('2026-09-18'),
        status: 'EM_ANDAMENTO',
        observacoes: 'Inclui troca de correias, filtros e óleo',
      },
    }),
    prisma.manutencao.create({
      data: {
        veiculoId: veiculos[2].id,
        data: new Date('2026-07-01'),
        tipo: 'PREVENTIVA',
        descricao: 'Revisão 25.000 km - Troca de óleo e alinhamento',
        kmAtual: 22150,
        valorPecas: 380.00,
        valorMaoObra: 180.00,
        valorTotal: 560.00,
        oficina: 'Toyota Autorizada',
        dataProximaManutencao: new Date('2026-10-01'),
        status: 'AGENDADA',
        observacoes: 'Agendada para 01/07/2026',
      },
    }),
  ]);

  console.log(`✅ ${manutencoes.length} manutenções criadas`);

  // Contratos
  const contratos = await Promise.all([
    prisma.contratoVeiculo.create({
      data: {
        veiculoId: veiculos[0].id,
        tipo: 'SEGURO',
        seguradora: 'Porto Seguro',
        numeroApolice: 'AP-2024-001',
        valor: 3200.00,
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-12-31'),
        dataVencimento: new Date('2026-12-15'),
        status: 'ATIVO',
      },
    }),
    prisma.contratoVeiculo.create({
      data: {
        veiculoId: veiculos[1].id,
        tipo: 'FINANCIAMENTO',
        instituicao: 'Banco do Brasil',
        numeroContrato: 'FIN-2023-456',
        valor: 145000.00,
        dataInicio: new Date('2023-03-15'),
        dataFim: new Date('2028-03-15'),
        dataVencimento: new Date('2026-07-15'),
        status: 'ATIVO',
        observacoes: '48 parcelas de R$ 3.020,83',
      },
    }),
    prisma.contratoVeiculo.create({
      data: {
        veiculoId: veiculos[2].id,
        tipo: 'SEGURO',
        seguradora: 'SulAmérica',
        numeroApolice: 'AP-2024-002',
        valor: 4800.00,
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-12-31'),
        dataVencimento: new Date('2026-12-20'),
        status: 'ATIVO',
      },
    }),
  ]);

  console.log(`✅ ${contratos.length} contratos criados`);

  // Multas
  const multas = await Promise.all([
    prisma.multa.create({
      data: {
        veiculoId: veiculos[0].id,
        data: new Date('2026-05-10'),
        orgao: 'CET-SP',
        infracao: 'Excesso de velocidade - 20% acima do limite',
        pontuacao: 4,
        valor: 195.23,
        local: 'Av. Paulista, 1000',
        status: 'PAGA',
        dataPagamento: new Date('2026-05-25'),
      },
    }),
    prisma.multa.create({
      data: {
        veiculoId: veiculos[1].id,
        data: new Date('2026-06-08'),
        orgao: 'ARTESP',
        infracao: 'Estacionar em local proibido',
        pontuacao: 3,
        valor: 156.78,
        local: 'Rodovia dos Bandeirantes, km 45',
        status: 'PENDENTE',
      },
    }),
    prisma.multa.create({
      data: {
        veiculoId: veiculos[2].id,
        data: new Date('2026-06-01'),
        orgao: 'CET-SP',
        infracao: 'Avanço de sinal vermelho',
        pontuacao: 7,
        valor: 293.47,
        local: 'Av. Brasil x Rua Augusta',
        status: 'RECORRENDO',
      },
    }),
  ]);

  console.log(`✅ ${multas.length} multas criadas`);

  // Rotas
  const rotas = await Promise.all([
    prisma.rota.create({
      data: {
        descricao: 'Entrega centro - Loja 01',
        veiculoId: veiculos[0].id,
        motoristaId: motoristas[0].id,
        origem: 'CD Centro',
        destino: 'Loja 01 - Zona Sul',
        distanciaKm: 25.5,
        dataSaida: new Date('2026-06-18T08:00:00'),
        status: 'EM_ANDAMENTO',
      },
    }),
    prisma.rota.create({
      data: {
        descricao: 'Transferência CD para filial ABC',
        veiculoId: veiculos[1].id,
        motoristaId: motoristas[1].id,
        origem: 'CD Matriz',
        destino: 'Filial ABC - Interior',
        distanciaKm: 180.0,
        dataSaida: new Date('2026-06-17T06:00:00'),
        dataChegada: new Date('2026-06-17T10:30:00'),
        status: 'CONCLUIDA',
      },
    }),
    prisma.rota.create({
      data: {
        descricao: 'Supervisão de filiais - Região Norte',
        veiculoId: veiculos[2].id,
        motoristaId: motoristas[3].id,
        origem: 'Matriz',
        destino: 'Filiais Norte',
        distanciaKm: 220.0,
        status: 'PLANEJADA',
      },
    }),
  ]);

  console.log(`✅ ${rotas.length} rotas criadas`);

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
