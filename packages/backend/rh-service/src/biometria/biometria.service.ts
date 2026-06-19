import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  RegisterDigitalDto, RegisterFaceDto, ValidarBiometriaDto,
  BiometriaQueryDto, BiometriaDeviceDto, BiometriaTipo, BiometriaStatus,
} from './dto/biometria.dto';

@Injectable()
export class BiometriaService {
  private readonly logger = new Logger(BiometriaService.name);
  private readonly MAX_TENTATIVAS = 5;
  private readonly BLOQUEIO_MINUTOS = 30;
  private readonly MATCH_THRESHOLD = 75;

  constructor(private prisma: PrismaService) {}

  async registerDigital(dto: RegisterDigitalDto) {
    await this.validarFuncionario(dto.funcionarioId);

    const existing = await this.prisma.biometria.findFirst({
      where: {
        funcionarioId: dto.funcionarioId,
        tipo: 'DIGITAL',
        status: 'ATIVO',
      },
    });
    if (existing) {
      await this.prisma.biometria.update({
        where: { id: existing.id },
        data: { status: 'EXPIRADO' },
      });
    }

    const biometria = await this.prisma.biometria.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipo: 'DIGITAL',
        templateHash: dto.templateHash,
        templateFormato: dto.templateFormato,
        qualidade: dto.qualidade ?? 85,
        dispositivoId: dto.dispositivoId,
        deviceId: dto.deviceId,
        metadata: { dedo: dto.dedo || 'INDICADOR_DIREITO' },
      },
    });

    this.logger.log(`Digital registrada: func=${dto.funcionarioId}`);
    return { success: true, data: biometria, message: 'Digital registrada com sucesso' };
  }

  async registerFace(dto: RegisterFaceDto) {
    await this.validarFuncionario(dto.funcionarioId);

    const existing = await this.prisma.biometria.findFirst({
      where: {
        funcionarioId: dto.funcionarioId,
        tipo: 'FACE',
        status: 'ATIVO',
      },
    });
    if (existing) {
      await this.prisma.biometria.update({
        where: { id: existing.id },
        data: { status: 'EXPIRADO' },
      });
    }

    const biometria = await this.prisma.biometria.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipo: 'FACE',
        templateHash: dto.templateHash,
        templateFormato: 'face-embedding-v1',
        qualidade: dto.qualidade ?? 80,
        dispositivoId: dto.dispositivoId,
        deviceId: dto.deviceId,
        metadata: {
          iluminacao: dto.iluminacao ?? 0.8,
          angulo: dto.angulo ?? 0,
          temFoto: !!dto.fotoBase64,
        },
      },
    });

    this.logger.log(`Face registrada: func=${dto.funcionarioId}`);
    return { success: true, data: biometria, message: 'Face registrada com sucesso' };
  }

  async validarBiometria(dto: ValidarBiometriaDto) {
    await this.verificarBloqueio(dto.funcionarioId);

    const template = await this.prisma.biometria.findFirst({
      where: {
        funcionarioId: dto.funcionarioId,
        tipo: dto.tipo,
        status: 'ATIVO',
      },
    });

    if (!template) {
      await this.registrarTentativa(dto.funcionarioId, dto.tipo, false, 'Template não encontrado');
      throw new NotFoundException(`Nenhum template ${dto.tipo} ativo encontrado para o funcionário`);
    }

    const matchPercent = this.calcularMatch(dto.templateHash, template.templateHash);

    if (matchPercent < this.MATCH_THRESHOLD) {
      await this.registrarTentativa(dto.funcionarioId, dto.tipo, false, `Match baixo: ${matchPercent.toFixed(1)}%`);
      return {
        success: false,
        matched: false,
        matchPercent,
        message: `Biometria não confirmada (${matchPercent.toFixed(1)}%) - mínimo ${this.MATCH_THRESHOLD}%`,
      };
    }

    await this.registrarTentativa(dto.funcionarioId, dto.tipo, true, `Match: ${matchPercent.toFixed(1)}%`);

    this.logger.log(`Biometria validada: func=${dto.funcionarioId}, tipo=${dto.tipo}, match=${matchPercent.toFixed(1)}%`);
    return {
      success: true,
      matched: true,
      matchPercent,
      templateId: template.id,
      message: `Biometria confirmada (${matchPercent.toFixed(1)}%)`,
    };
  }

  async validarDigital(dto: ValidarBiometriaDto) {
    return this.validarBiometria({ ...dto, tipo: BiometriaTipo.DIGITAL });
  }

  async validarFace(dto: ValidarBiometriaDto) {
    return this.validarBiometria({ ...dto, tipo: BiometriaTipo.FACE });
  }

  async findByFuncionario(funcionarioId: string) {
    await this.validarFuncionario(funcionarioId);
    const registros = await this.prisma.biometria.findMany({
      where: { funcionarioId },
      include: { tentativas: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: funcionarioId },
      select: { id: true, nome: true, matricula: true },
    });
    return { success: true, data: { funcionario, biometrias: registros } };
  }

  async listDevices(unidadeId?: string) {
    const where: any = {};
    if (unidadeId) where.unidadeId = unidadeId;
    const devices = await this.prisma.biometriaDevice.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
    return { success: true, data: devices };
  }

  async registerDevice(dto: BiometriaDeviceDto) {
    const device = await this.prisma.biometriaDevice.create({
      data: {
        nome: dto.nome,
        fabricante: dto.fabricante,
        modelo: dto.modelo,
        tipo: dto.tipo as any,
        ip: dto.ip,
        mac: dto.mac,
        serial: dto.serial,
        unidadeId: dto.unidadeId,
        localizacao: dto.localizacao,
        ativo: dto.ativo ?? true,
      },
    });
    return { success: true, data: device, message: 'Dispositivo registrado' };
  }

  async updateDevice(id: string, dto: Partial<BiometriaDeviceDto>) {
    const existing = await this.prisma.biometriaDevice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dispositivo não encontrado');

    const updated = await this.prisma.biometriaDevice.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.fabricante !== undefined && { fabricante: dto.fabricante }),
        ...(dto.modelo !== undefined && { modelo: dto.modelo }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo as any }),
        ...(dto.ip !== undefined && { ip: dto.ip }),
        ...(dto.mac !== undefined && { mac: dto.mac }),
        ...(dto.serial !== undefined && { serial: dto.serial }),
        ...(dto.unidadeId !== undefined && { unidadeId: dto.unidadeId }),
        ...(dto.localizacao !== undefined && { localizacao: dto.localizacao }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
    return { success: true, data: updated };
  }

  async removeDevice(id: string) {
    const existing = await this.prisma.biometriaDevice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dispositivo não encontrado');
    await this.prisma.biometriaDevice.delete({ where: { id } });
    return { success: true, message: 'Dispositivo removido' };
  }

  async tentativasHistory(funcionarioId: string) {
    const tentativas = await this.prisma.biometriaTentativa.findMany({
      where: { funcionarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const falhasRecentes = tentativas.filter(t => !t.sucesso && this.minutosDesde(t.createdAt) < this.BLOQUEIO_MINUTOS);
    return {
      success: true,
      data: tentativas,
      bloqueado: falhasRecentes.length >= this.MAX_TENTATIVAS,
      falhasRecentes: falhasRecentes.length,
      maxTentativas: this.MAX_TENTATIVAS,
    };
  }

  async reportSpoofing(dto: any) {
    await this.prisma.spoofingAlert.create({
      data: {
        funcionarioId: dto.funcionarioId,
        tipo: dto.tipo,
        motivo: dto.motivo,
        scoreSuspeita: dto.scoreSuspeita ?? 0,
        deviceId: dto.deviceId,
        fotoEvidencia: dto.fotoEvidencia,
      },
    });
    this.logger.warn(`Spoofing detectado: func=${dto.funcionarioId}, tipo=${dto.tipo}, motivo=${dto.motivo}`);
    return { success: true, message: 'Alerta de spoofing registrado' };
  }

  async remove(id: string) {
    const existing = await this.prisma.biometria.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Template biométrico não encontrado');
    await this.prisma.biometria.update({
      where: { id },
      data: { status: 'EXPIRADO' },
    });
    return { success: true, message: 'Template biométrico removido' };
  }

  private async validarFuncionario(funcionarioId: string) {
    const func = await this.prisma.funcionario.findUnique({ where: { id: funcionarioId } });
    if (!func) throw new NotFoundException('Funcionário não encontrado');
    if (func.status !== 'ATIVO') throw new BadRequestException('Funcionário não está ativo');
    return func;
  }

  private async verificarBloqueio(funcionarioId: string) {
    const recentes = await this.prisma.biometriaTentativa.findMany({
      where: {
        funcionarioId,
        sucesso: false,
        createdAt: { gte: new Date(Date.now() - this.BLOQUEIO_MINUTOS * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentes.length >= this.MAX_TENTATIVAS) {
      const oldest = recentes[recentes.length - 1];
      const desbloqueio = new Date(oldest.createdAt.getTime() + this.BLOQUEIO_MINUTOS * 60 * 1000);
      throw new BadRequestException(
        `Biometria bloqueada temporariamente por excesso de tentativas falhas. Tente novamente após ${desbloqueio.toLocaleTimeString()}`,
      );
    }
  }

  private async registrarTentativa(funcionarioId: string, tipo: string, sucesso: boolean, mensagem: string) {
    await this.prisma.biometriaTentativa.create({
      data: { funcionarioId, tipo, sucesso, mensagem },
    });
  }

  private calcularMatch(hash1: string, hash2: string): number {
    if (hash1 === hash2) return 100;
    if (!hash1 || !hash2) return 0;

    const maxLen = Math.max(hash1.length, hash2.length);
    const minLen = Math.min(hash1.length, hash2.length);
    let matches = 0;
    for (let i = 0; i < minLen; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    const similaridade = (matches / maxLen) * 100;
    return Math.round(similaridade * 10) / 10;
  }

  private minutosDesde(date: Date): number {
    return (Date.now() - date.getTime()) / 60000;
  }
}
