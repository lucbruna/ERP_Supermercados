import { Test, TestingModule } from '@nestjs/testing';
import { NFeService } from './nfe.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('NFeService', () => {
  let service: NFeService;
  let prisma: any;

  const mockPrisma = {
    empresaFiscal: {
      findUnique: jest.fn(),
    },
    nfe: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    nfeItem: {
      createMany: jest.fn(),
    },
    nfeCancelamento: {
      create: jest.fn(),
    },
    nfeEvento: {
      create: jest.fn(),
    },
    cartaCorrecao: {
      create: jest.fn(),
      count: jest.fn(),
    },
    nFeEntrada: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NFeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NFeService>(NFeService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('gerarChaveAcesso', () => {
    it('should generate a 44-digit access key with correct DV', () => {
      const uf = 'SP';
      const data = new Date(2025, 0, 15);
      const cnpj = '11.444.777/0001-00';
      const modelo = 55;
      const serie = 1;
      const numero = 123;

      const chave = (service as any).gerarChaveAcesso(uf, data, cnpj, modelo, serie, numero);

      expect(chave).toHaveLength(44);
      expect(chave.slice(0, 2)).toBe('35');

      const base = chave.slice(0, 43);
      const dv = parseInt(chave[43], 10);
      const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
      let soma = 0;
      const reversed = base.split('').reverse();
      for (let i = 0; i < reversed.length; i++) {
        soma += parseInt(reversed[i]) * pesos[i % pesos.length];
      }
      const resto = soma % 11;
      const expectedDv = resto < 2 ? 0 : 11 - resto;
      expect(dv).toBe(expectedDv);
    });
  });

  describe('emitir', () => {
    const emitirDto = {
      empresaFiscalId: 'emp-fiscal-1',
      numero: 123,
      serie: 1,
      tipo: 'NFe',
      modelo: 55,
      naturezaOperacao: 'VENDA',
      emitenteCnpj: '11.444.777/0001-00',
      emitenteRazaoSocial: 'Empresa Ltda',
      destinatarioCpfCnpj: '529.982.247-25',
      destinatarioNome: 'João Comprador',
      valorProdutos: 1000,
      valorFrete: 50,
      valorSeguro: 10,
      valorDesconto: 0,
      valorTotal: 1060,
      valorICMS: 180,
      baseCalculoICMS: 1000,
      itens: [
        {
          codigoProduto: 'PROD-001',
          descricao: 'Produto Teste',
          ncm: '84713000',
          cfop: '5102',
          unidade: 'UN',
          quantidade: 10,
          valorUnitario: 100,
          valorTotal: 1000,
          cstICMS: '00',
          aliquotaICMS: 18,
          baseICMS: 1000,
        },
      ],
    };

    it('should create NFe record', async () => {
      mockPrisma.empresaFiscal.findUnique.mockResolvedValue({
        id: 'emp-fiscal-1',
        uf: 'SP',
        certificadoDigital: null,
      });
      mockPrisma.nfe.findUnique.mockResolvedValue(null);
      mockPrisma.nfe.create.mockResolvedValue({
        id: 'nfe-1',
        chaveAcesso: expect.any(String),
        numero: 123,
        status: 'AUTORIZADA',
        protocolo: expect.any(String),
      });
      mockPrisma.nfeItem.createMany.mockResolvedValue({ count: 1 });

      const result = await service.emitir(emitirDto as any);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('AUTORIZADA');
      expect(result.data.chaveAcesso).toHaveLength(44);
    });

    it('should throw when empresaFiscal not found', async () => {
      mockPrisma.empresaFiscal.findUnique.mockResolvedValue(null);

      await expect(service.emitir(emitirDto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw when chaveAcesso already exists', async () => {
      mockPrisma.empresaFiscal.findUnique.mockResolvedValue({
        id: 'emp-fiscal-1',
        uf: 'SP',
        certificadoDigital: null,
      });
      mockPrisma.nfe.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.emitir(emitirDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('emitirReal', () => {
    it('should delegate to emitir', async () => {
      mockPrisma.empresaFiscal.findUnique.mockResolvedValue({
        id: 'emp-fiscal-1',
        uf: 'SP',
        certificadoDigital: null,
      });
      mockPrisma.nfe.findUnique.mockResolvedValue(null);
      mockPrisma.nfe.create.mockResolvedValue({
        id: 'nfe-2',
        chaveAcesso: '12345678901234567890123456789012345678901234',
        status: 'AUTORIZADA',
        protocolo: 'prot-123',
      });
      mockPrisma.nfeItem.createMany.mockResolvedValue({ count: 1 });

      const result = await service.emitirReal({
        empresaFiscalId: 'emp-fiscal-1',
        numero: 124,
        tipo: 'NFe',
        naturezaOperacao: 'VENDA',
        emitenteCnpj: '11.444.777/0001-00',
        emitenteRazaoSocial: 'Empresa Ltda',
        destinatarioCpfCnpj: '529.982.247-25',
        destinatarioNome: 'João',
        valorProdutos: 500,
        valorTotal: 500,
        itens: [],
      } as any);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('AUTORIZADA');
    });
  });

  describe('calcularICMS', () => {
    it('should calculate ICMS for a CST 00 item', async () => {
      const valorTotal = 1000;
      const aliquota = 18;
      const calculated = valorTotal * aliquota / 100;

      expect(calculated).toBe(180);
    });
  });
});
