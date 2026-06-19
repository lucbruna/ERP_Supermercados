import { Test, TestingModule } from '@nestjs/testing';
import { PontoService } from './ponto.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PontoService', () => {
  let service: PontoService;
  let prisma: any;

  const mockPrisma = {
    funcionario: {
      findUnique: jest.fn(),
    },
    registroPonto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    biometria: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    espelhoPonto: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PontoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PontoService>(PontoService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      funcionarioId: 'emp-1',
      tipo: 'ENTRADA',
      dataHora: new Date().toISOString(),
      origem: 'MANUAL',
      latitude: -23.5505,
      longitude: -46.6333,
      biometriaHash: 'hash-digital-abc',
    };

    it('should register a ponto with valid biometric match', async () => {
      const now = new Date();
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO', unidadeId: 'uni-1' });
      mockPrisma.registroPonto.findFirst.mockResolvedValue(null);
      mockPrisma.registroPonto.create.mockResolvedValue({
        id: 'ponto-1',
        funcionarioId: 'emp-1',
        tipo: 'ENTRADA',
        dataHora: now,
        validado: false,
      });
      mockPrisma.biometria.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.create(createDto as any);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('ponto-1');
    });

    it('should register a ponto without biometric data using existing data', async () => {
      const now = new Date();
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO', unidadeId: 'uni-1' });
      mockPrisma.registroPonto.findFirst.mockResolvedValue(null);
      mockPrisma.registroPonto.create.mockResolvedValue({
        id: 'ponto-2',
        funcionarioId: 'emp-1',
        tipo: 'SAIDA',
        dataHora: now,
        validado: false,
      });
      mockPrisma.biometria.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.create({
        ...createDto,
        tipo: 'SAIDA' as any,
        biometriaHash: undefined,
      } as any);

      expect(result.success).toBe(true);
      expect(mockPrisma.registroPonto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ biometriaHash: expect.anything() }),
        }),
      );
    });

    it('should reject when funcionario is not active', async () => {
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'INATIVO' });

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('registrarComBiometria', () => {
    it('should throw when biometric tipo is empty', async () => {
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO' });
      mockPrisma.registroPonto.findFirst.mockResolvedValue(null);

      await expect(
        service.registrarComBiometria({
          funcionarioId: 'emp-1',
          tipo: 'ENTRADA' as any,
          dataHora: new Date().toISOString(),
          biometriaTipo: '',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require both digital and face templates for DUPLO', async () => {
      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO' });
      mockPrisma.registroPonto.findFirst.mockResolvedValue(null);
      mockPrisma.biometria.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'face-1' });

      await expect(
        service.registrarComBiometria({
          funcionarioId: 'emp-1',
          tipo: 'ENTRADA' as any,
          dataHora: new Date().toISOString(),
          biometriaTipo: 'DUPLO',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getToday', () => {
    it('should return today records', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const registros = [
        { id: 'p-1', tipo: 'ENTRADA', dataHora: new Date() },
      ];

      mockPrisma.registroPonto.findMany.mockResolvedValue(registros);

      const result = await service.findToday('emp-1');

      expect(result.success).toBe(true);
      expect(result.data.registros).toHaveLength(1);
      expect(mockPrisma.registroPonto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            funcionarioId: 'emp-1',
            dataHora: expect.objectContaining({ gte: expect.any(Date) }),
          }),
        }),
      );
    });
  });

  describe('getCurrent', () => {
    it('should return active session when last record is ENTRADA', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      mockPrisma.registroPonto.findFirst.mockResolvedValue({
        id: 'p-1',
        tipo: 'ENTRADA',
        dataHora: new Date(),
      });

      const result = await service.findCurrent('emp-1');

      expect(result.success).toBe(true);
      expect(result.data!.id).toBe('p-1');
      expect(result.isClockedIn).toBe(true);
    });

    it('should return isClockedIn false when last record is SAIDA', async () => {
      mockPrisma.registroPonto.findFirst.mockResolvedValue({
        id: 'p-2',
        tipo: 'SAIDA',
        dataHora: new Date(),
      });

      const result = await service.findCurrent('emp-1');

      expect(result.isClockedIn).toBe(false);
    });

    it('should return null data when no records today', async () => {
      mockPrisma.registroPonto.findFirst.mockResolvedValue(null);

      const result = await service.findCurrent('emp-1');

      expect(result.data).toBeNull();
      expect(result.isClockedIn).toBe(false);
    });
  });
});
