import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { GerarCodigoDto, ValidarCodigoDto, ImagemCodigoDto } from './dto/gerar-codigo.dto';
import { TipoCodigoBarras } from '@prisma/client';
import * as bwipjs from 'bwip-js';
import * as QRCode from 'qrcode';

@Injectable()
export class CodigosService {
  private readonly logger = new Logger(CodigosService.name);

  constructor(private prisma: PrismaService) {}

  async gerar(dto: GerarCodigoDto) {
    const quantidade = dto.quantidade || 1;
    const codigos: string[] = [];

    for (let i = 0; i < quantidade; i++) {
      const codigo = this.gerarNumeroCodigo(dto.tipo, dto.produtoId, i);
      const existente = await this.prisma.codigoBarras.findUnique({ where: { codigo } });
      if (existente) throw new ConflictException(`Código de barras ${codigo} já existe`);

      const record = await this.prisma.codigoBarras.create({
        data: {
          produtoId: dto.produtoId,
          codigo,
          tipo: dto.tipo,
          ePrimario: dto.ePrimario && i === 0,
        },
      });
      codigos.push(record.codigo);
    }

    this.logger.log(`${quantidade} código(s) gerado(s) para produto ${dto.produtoId}`);
    return { success: true, data: { produtoId: dto.produtoId, tipo: dto.tipo, codigos } };
  }

  async buscarPorCodigo(codigo: string) {
    const record = await this.prisma.codigoBarras.findUnique({ where: { codigo } });
    if (!record) throw new NotFoundException('Código de barras não encontrado');
    return { success: true, data: record };
  }

  async listarPorProduto(produtoId: string) {
    const records = await this.prisma.codigoBarras.findMany({
      where: { produtoId },
      orderBy: { ePrimario: 'desc' },
    });
    return { success: true, data: records };
  }

  async ativar(id: string) {
    const record = await this.prisma.codigoBarras.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Código de barras não encontrado');

    const updated = await this.prisma.codigoBarras.update({
      where: { id },
      data: { status: 'Ativo' },
    });
    return { success: true, data: updated };
  }

  async inativar(id: string) {
    const record = await this.prisma.codigoBarras.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Código de barras não encontrado');

    const updated = await this.prisma.codigoBarras.update({
      where: { id },
      data: { status: 'Inativo' },
    });
    return { success: true, data: updated };
  }

  async validar(dto: ValidarCodigoDto) {
    const erros: string[] = [];

    if (!dto.codigo || dto.codigo.length === 0) {
      erros.push('Código não informado');
    }

    switch (dto.tipo) {
      case 'EAN13':
        if (dto.codigo.length !== 13) {
          erros.push('EAN-13 deve ter 13 dígitos');
        } else if (!/^\d+$/.test(dto.codigo)) {
          erros.push('EAN-13 deve conter apenas dígitos');
        } else {
          const digito = this.calcularDigitoEAN13(dto.codigo.substring(0, 12));
          if (dto.codigo[12] !== String(digito)) {
            erros.push(`Dígito verificador inválido. Esperado: ${digito}`);
          }
        }
        break;
      case 'UPC':
        if (dto.codigo.length !== 12) {
          erros.push('UPC deve ter 12 dígitos');
        } else if (!/^\d+$/.test(dto.codigo)) {
          erros.push('UPC deve conter apenas dígitos');
        }
        break;
      case 'CODE128':
        if (dto.codigo.length < 1 || dto.codigo.length > 80) {
          erros.push('CODE128 deve ter entre 1 e 80 caracteres');
        }
        break;
      case 'DUN14':
        if (dto.codigo.length !== 14) {
          erros.push('DUN-14 deve ter 14 dígitos');
        } else if (!/^\d+$/.test(dto.codigo)) {
          erros.push('DUN-14 deve conter apenas dígitos');
        }
        break;
      case 'GS1':
        if (dto.codigo.length < 8 || dto.codigo.length > 48) {
          erros.push('GS1-128 deve ter entre 8 e 48 caracteres');
        }
        break;
    }

    const valido = erros.length === 0;
    return { success: true, data: { valido, erros: valido ? undefined : erros } };
  }

  async gerarImagem(dto: ImagemCodigoDto) {
    const formato = dto.formato || 'png';
    const largura = dto.largura || 200;
    const altura = dto.altura || 100;

    if (dto.tipo as any === 'QRCODE') {
      const dataUri = await QRCode.toDataURL(dto.codigo, {
        width: largura,
        margin: 2,
        color: { dark: '#000', light: '#fff' },
      });
      return { success: true, data: { imagem: dataUri, formato: 'png' } };
    }

    const bcid = this.mapearFormatoBwip(dto.tipo);

    return new Promise((resolve, reject) => {
      bwipjs.toBuffer({
        bcid,
        text: dto.codigo,
        scaleX: 1,
        scaleY: 1,
        width: largura,
        height: bcid === 'qrcode' ? altura : undefined,
        includetext: true,
        textxalign: 'center',
      }, (err, buf) => {
        if (err) {
          reject(new BadRequestException(`Erro ao gerar imagem: ${(err as Error).message}`));
          return;
        }
        const base64 = buf.toString('base64');
        const mime = formato === 'svg' ? 'image/svg+xml' : 'image/png';
        const dataUri = `data:${mime};base64,${base64}`;
        resolve({ success: true, data: { imagem: dataUri, formato } });
      });
    });
  }

  private gerarNumeroCodigo(tipo: TipoCodigoBarras, produtoId: string, index: number): string {
    const hash = this.hashCode(produtoId + index);
    const timestamp = Date.now() % 100000;

    switch (tipo) {
      case 'EAN13': {
        const base = String(7890000000000 + (hash % 1000000) + timestamp).slice(0, 12);
        const digito = this.calcularDigitoEAN13(base);
        return base + digito;
      }
      case 'UPC': {
        const base = String(100000000000 + (hash % 100000) + timestamp).slice(0, 12);
        return base;
      }
      case 'CODE128':
        return `PD${produtoId.slice(0, 6).toUpperCase()}${String(hash).slice(0, 5)}`;
      case 'DUN14': {
        const base = String(10000000000000 + (hash % 1000000) + timestamp).slice(0, 14);
        return base;
      }
      case 'GS1': {
        const base = String(10000000 + (hash % 100000) + timestamp).slice(0, 14);
        return `(01)${base}`;
      }
    }
  }

  private calcularDigitoEAN13(base: string): number {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      const digito = parseInt(base[i], 10);
      soma += (i % 2 === 0) ? digito * 1 : digito * 3;
    }
    return (10 - (soma % 10)) % 10;
  }

  private mapearFormatoBwip(tipo: TipoCodigoBarras): string {
    switch (tipo) {
      case 'EAN13': return 'ean13';
      case 'UPC': return 'upca';
      case 'CODE128': return 'code128';
      case 'DUN14': return 'dun14';
      case 'GS1': return 'gs1-128';
      default: return 'code128';
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
