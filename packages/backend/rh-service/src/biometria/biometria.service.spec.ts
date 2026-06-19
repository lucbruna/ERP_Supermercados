import { Test, TestingModule } from '@nestjs/testing';
import { BiometriaService } from './biometria.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BiometriaService', () => {
  let service: BiometriaService;
  let prisma: any;

  const mockPrisma = {
    funcionario: {
      findUnique: jest.fn(),
    },
    biometria: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    biometriaTentativa: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    biometriaDevice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    spoofingAlert: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiometriaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BiometriaService>(BiometriaService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('registerDigital', () => {
    it('should store biometric hash for active employee', async () => {
      const dto = {
        funcionarioId: 'emp-1',
        templateHash: 'hash-digital-abc',
        templateFormato: 'ISO_19794_2',
        dedo: 'INDICADOR_DIREITO',
        qualidade: 90,
      };

      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO' });
      mockPrisma.biometria.findFirst.mockResolvedValue(null);
      mockPrisma.biometria.create.mockResolvedValue({
        id: 'bio-1',
        funcionarioId: 'emp-1',
        tipo: 'DIGITAL',
        templateHash: 'hash-digital-abc',
        templateFormato: 'ISO_19794_2',
        qualidade: 90,
        metadata: { dedo: 'INDICADOR_DIREITO' },
      });

      const result = await service.registerDigital(dto as any);

      expect(result.success).toBe(true);
      expect(result.message).toContain('registrada');
      expect(mockPrisma.biometria.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ templateHash: 'hash-digital-abc' }),
        }),
      );
    });

    it('should expire existing active digital before registering new one', async () => {
      const dto = {
        funcionarioId: 'emp-1',
        templateHash: 'hash-digital-xyz',
        templateFormato: 'ISO_19794_2',
      };

      mockPrisma.funcionario.findUnique.mockResolvedValue({ id: 'emp-1', status: 'ATIVO' });
      mockPrisma.biometria.findFirst.mockResolvedValue({
        id: 'bio-old',
        funcionarioId: 'emp-1',
        tipo: 'DIGITAL',
        status: 'ATIVO',
      });
      mockPrisma.biometria.create.mockResolvedValue({ id: 'bio-new', templateHash: 'hash-digital-xyz' });

      await service.registerDigital(dto as any);

      expect(mockPrisma.biometria.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bio-old' },
          data: { status: 'EXPIRADO' },
        }),
      );
    });
  });

  describe('validarBiometria', () => {
    it('should reject when blocking is active (>= 5 attempts)', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([
        { createdAt: new Date(Date.now() - 1000 * 60) },
        { createdAt: new Date(Date.now() - 1000 * 60 * 2) },
        { createdAt: new Date(Date.now() - 1000 * 60 * 3) },
        { createdAt: new Date(Date.now() - 1000 * 60 * 4) },
        { createdAt: new Date(Date.now() - 1000 * 60 * 5) },
      ]);

      await expect(
        service.validarBiometria({ funcionarioId: 'emp-1', tipo: 'DIGITAL' as any, templateHash: 'x' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return match result with percentage', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([]);
      mockPrisma.biometria.findFirst.mockResolvedValue({
        id: 'bio-1',
        templateHash: 'abcdef',
      });
      mockPrisma.biometriaTentativa.create.mockResolvedValue({});

      const result = await service.validarBiometria({
        funcionarioId: 'emp-1',
        tipo: 'DIGITAL' as any,
        templateHash: 'abcdef',
      });

      expect(result.success).toBe(true);
      expect(result.matched).toBe(true);
      expect(result.matchPercent).toBe(100);
    });

    it('should return low match when templates differ', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([]);
      mockPrisma.biometria.findFirst.mockResolvedValue({
        id: 'bio-1',
        templateHash: 'abcdefghij',
      });
      mockPrisma.biometriaTentativa.create.mockResolvedValue({});

      const result = await service.validarBiometria({
        funcionarioId: 'emp-1',
        tipo: 'DIGITAL' as any,
        templateHash: 'xxxxxxghij',
      });

      expect(result.success).toBe(false);
      expect(result.matched).toBe(false);
      expect(result.matchPercent).toBeLessThan(75);
    });

    it('should throw when no active template found', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([]);
      mockPrisma.biometria.findFirst.mockResolvedValue(null);
      mockPrisma.biometriaTentativa.create.mockResolvedValue({});

      await expect(
        service.validarBiometria({
          funcionarioId: 'emp-1',
          tipo: 'DIGITAL' as any,
          templateHash: 'x',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validarBiometriaDigital', () => {
    it('should delegate to validarBiometria with DIGITAL tipo', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([]);
      mockPrisma.biometria.findFirst.mockResolvedValue({ id: 'bio-1', templateHash: 'hash' });
      mockPrisma.biometriaTentativa.create.mockResolvedValue({});

      const result = await service.validarDigital({
        funcionarioId: 'emp-1',
        tipo: 'DIGITAL' as any,
        templateHash: 'hash',
      });

      expect(result.matched).toBe(true);
    });
  });

  describe('validarBiometriaFacial', () => {
    it('should delegate to validarBiometria with FACE tipo', async () => {
      mockPrisma.biometriaTentativa.findMany.mockResolvedValue([]);
      mockPrisma.biometria.findFirst.mockResolvedValue({ id: 'bio-1', templateHash: 'face-hash' });
      mockPrisma.biometriaTentativa.create.mockResolvedValue({});

      const result = await service.validarFace({
        funcionarioId: 'emp-1',
        tipo: 'FACE' as any,
        templateHash: 'face-hash',
      });

      expect(result.matched).toBe(true);
    });
  });

  describe('spoofing detection', () => {
    it('should register spoofing alert', async () => {
      mockPrisma.spoofingAlert.create.mockResolvedValue({ id: 'alert-1' });

      const result = await service.reportSpoofing({
        funcionarioId: 'emp-1',
        tipo: 'FACE',
        motivo: 'Foto detectada no lugar de rosto real',
        scoreSuspeita: 92,
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.spoofingAlert.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ motivo: 'Foto detectada no lugar de rosto real' }),
        }),
      );
    });
  });
});
