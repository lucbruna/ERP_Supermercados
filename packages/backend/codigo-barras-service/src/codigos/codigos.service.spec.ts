import { Test, TestingModule } from '@nestjs/testing';
import { CodigosService } from './codigos.service';
import { PrismaService } from '../common/prisma.service';

describe('CodigosService', () => {
  let service: CodigosService;
  let prisma: any;

  const mockPrisma = {
    codigoBarras: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodigosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CodigosService>(CodigosService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('gerarCodigo - EAN-13', () => {
    it('should generate a 13-digit EAN-13 with valid check digit', async () => {
      mockPrisma.codigoBarras.findUnique.mockResolvedValue(null);
      mockPrisma.codigoBarras.create.mockImplementation(({ data }) => ({
        id: 'code-1',
        ...data,
      }));

      const result = await service.gerar({
        produtoId: 'prod-1',
        tipo: 'EAN13' as any,
        quantidade: 1,
      });

      const codigo = result.data.codigos[0];
      expect(codigo).toHaveLength(13);
      expect(/^\d+$/.test(codigo)).toBe(true);

      const base = codigo.slice(0, 12);
      const digito = parseInt(codigo[12], 10);
      let soma = 0;
      for (let i = 0; i < base.length; i++) {
        soma += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const expectedDigito = (10 - (soma % 10)) % 10;
      expect(digito).toBe(expectedDigito);
    });
  });

  describe('validar', () => {
    it('should pass for valid EAN-13', async () => {
      const codigoValido = '7890000000017';
      let soma = 0;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(codigoValido[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const digito = (10 - (soma % 10)) % 10;
      const codigo = codigoValido.slice(0, 12) + digito;

      const result = await service.validar({ codigo, tipo: 'EAN13' as any });
      expect(result.data.valido).toBe(true);
    });

    it('should fail for invalid check digit', async () => {
      const result = await service.validar({ codigo: '7890000000018', tipo: 'EAN13' as any });
      expect(result.data.valido).toBe(false);
      expect(result.data.erros).toEqual(
        expect.arrayContaining([expect.stringContaining('Dígito verificador')]),
      );
    });

    it('should fail if EAN-13 is not 13 digits', async () => {
      const result = await service.validar({ codigo: '1234567890', tipo: 'EAN13' as any });
      expect(result.data.valido).toBe(false);
    });

    it('should fail if EAN-13 contains non-digits', async () => {
      const result = await service.validar({ codigo: 'abcdefghijk12', tipo: 'EAN13' as any });
      expect(result.data.valido).toBe(false);
    });
  });

  describe('gerarImagem', () => {
    it('should generate a QRCODE and return base64 data URI', async () => {
      const result = await service.gerarImagem({
        codigo: '1234567890123',
        tipo: 'QRCODE' as any,
        formato: 'png',
      });

      expect((result as any).success).toBe(true);
      expect((result as any).data.imagem).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate barcode image and return base64 data URI for EAN-13', async () => {
      const codigo = '7890000000017';
      let soma = 0;
      for (let i = 0; i < 12; i++) {
        soma += parseInt(codigo[i], 10) * (i % 2 === 0 ? 1 : 3);
      }
      const digito = (10 - (soma % 10)) % 10;
      const full = codigo.slice(0, 12) + digito;

      const result = await service.gerarImagem({
        codigo: full,
        tipo: 'EAN13' as any,
        formato: 'png',
      });

      expect((result as any).success).toBe(true);
      expect((result as any).data.imagem).toMatch(/^data:image\/png;base64,/);
    });
  });
});
