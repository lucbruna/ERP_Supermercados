import { Test, TestingModule } from '@nestjs/testing';
import { ValidacaoService } from './validacao.service';
import { PrismaService } from '../common/prisma.service';

describe('ValidacaoService', () => {
  let service: ValidacaoService;
  let prisma: any;

  const mockPrisma = {
    ncm: {
      findUnique: jest.fn(),
    },
    cfop: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidacaoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ValidacaoService>(ValidacaoService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('validarCPF', () => {
    it('should validate a known valid CPF (529.982.247-25)', () => {
      const result = service.validarCpf('529.982.247-25');

      expect(result.success).toBe(true);
      expect(result.data!.mascarado).toBe('529.982.247-25');
    });

    it('should reject an invalid CPF', () => {
      const result = service.validarCpf('111.111.111-11');

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('repetidos')]),
      );
    });

    it('should reject CPF with invalid check digits', () => {
      const result = service.validarCpf('529.982.247-24');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject CPF with wrong length', () => {
      const result = service.validarCpf('123.456.789-0');

      expect(result.success).toBe(false);
    });
  });

  describe('validarCNPJ', () => {
    it('should validate a known valid CNPJ (11.444.777/0001-00)', () => {
      const result = service.validarCnpj('11.444.777/0001-00');

      expect(result.success).toBe(true);
      expect(result.data!.mascarado).toBe('11.444.777/0001-00');
    });

    it('should reject an invalid CNPJ', () => {
      const result = service.validarCnpj('11.444.777/0001-01');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject CNPJ with all same digits', () => {
      const result = service.validarCnpj('11.111.111/1111-11');

      expect(result.success).toBe(false);
    });

    it('should reject CNPJ with wrong length', () => {
      const result = service.validarCnpj('11.444.777/0001-0');

      expect(result.success).toBe(false);
    });
  });
});
