import { Test, TestingModule } from '@nestjs/testing';
import { ConveniosService } from './convenios.service';
import { PrismaService } from '../common/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ConveniosService', () => {
  let service: ConveniosService;
  let prisma: any;

  const mockPrisma = {
    convenio: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    faturaConvenio: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    vendaConvenio: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConveniosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConveniosService>(ConveniosService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      companyId: 'comp-1',
      unidadeId: 'uni-1',
      codigo: 'CONV-001',
      nome: 'Convenio Teste',
      cnpj: '11.444.777/0001-00',
      contato: 'João',
      telefone: '11999999999',
      email: 'joao@teste.com',
      endereco: { rua: 'Rua A' },
      limiteGlobal: 50000,
      descontoPadrao: 5,
      prazoPagamento: 30,
      tipoFaturamento: 'MENSAL',
      diaFechamento: 15,
    };

    it('should create a convenio with valid data', async () => {
      mockPrisma.convenio.findUnique.mockResolvedValue(null);
      mockPrisma.convenio.create.mockResolvedValue({ id: 'conv-1', ...createDto });

      const result = await service.create(createDto as any);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('conv-1');
    });

    it('should reject duplicate codigo', async () => {
      mockPrisma.convenio.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById (findOne)', () => {
    it('should return convenio with related data', async () => {
      const convenio = {
        id: 'conv-1',
        nome: 'Convenio Teste',
        contratos: [],
        _count: { faturas: 5, vendas: 10 },
      };

      mockPrisma.convenio.findUnique.mockResolvedValue(convenio);

      const result = await service.findOne('conv-1');

      expect(result.success).toBe(true);
      expect(result.data.nome).toBe('Convenio Teste');
    });

    it('should throw when convenio not found', async () => {
      mockPrisma.convenio.findUnique.mockResolvedValue(null);

      await expect(service.findOne('conv-invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update limiteGlobal and other fields', async () => {
      const existing = { id: 'conv-1', nome: 'Old Name', limiteGlobal: 10000, saldoUtilizado: 3000 };
      const updated = { ...existing, nome: 'New Name', limiteGlobal: 20000 };

      mockPrisma.convenio.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      mockPrisma.convenio.update.mockResolvedValue(updated);

      const result = await service.update('conv-1', { nome: 'New Name', limiteGlobal: 20000 } as any);

      expect(result.success).toBe(true);
      expect(result.data.limiteGlobal).toBe(20000);
      expect(result.data.nome).toBe('New Name');
    });
  });

  describe('dashboard', () => {
    it('should return correct KPIs', async () => {
      mockPrisma.convenio.findUnique.mockResolvedValue({
        id: 'conv-1',
        nome: 'Convenio Teste',
        limiteGlobal: 50000,
        saldoUtilizado: 15000,
      });

      mockPrisma.faturaConvenio.findMany
        .mockResolvedValueOnce([{ id: 'fat-1' }, { id: 'fat-2' }])
        .mockResolvedValueOnce([{ id: 'fat-3' }]);

      mockPrisma.vendaConvenio.findMany.mockResolvedValue([
        { id: 'ven-1' },
        { id: 'ven-2' },
        { id: 'ven-3' },
      ]);

      mockPrisma.faturaConvenio.aggregate.mockResolvedValue({
        _sum: { valorTotal: 10000, valorPago: 7000 },
      });

      const result = await service.dashboard('conv-1');

      expect(result.success).toBe(true);
      expect(result.data.resumo.limiteDisponivel).toBe(35000);
      expect(result.data.resumo.saldoUtilizado).toBe(15000);
      expect(result.data.resumo.faturasAbertas).toBe(2);
      expect(result.data.resumo.faturasVencidas).toBe(1);
      expect(result.data.resumo.vendasMes).toBe(3);
      expect(result.data.resumo.totalFaturado).toBe(10000);
      expect(result.data.resumo.totalPago).toBe(7000);
    });

    it('should throw when convenio not found for dashboard', async () => {
      mockPrisma.convenio.findUnique.mockResolvedValue(null);

      await expect(service.dashboard('conv-invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
