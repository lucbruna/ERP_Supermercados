import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(private prisma: PrismaService) {}

  async setupTotp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const secret = speakeasy.generateSecret({
      name: `ERP Supermercado (${user.email})`,
      issuer: 'ERP Supermercado',
      length: 20,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
        mfaTipo: 'TOTP',
      },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      success: true,
      secret: secret.base32,
      qrCode,
      message: 'Escaneie o QR Code com Google Authenticator ou similar',
    };
  }

  async validateTotp(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA não configurado');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Código inválido');
    }

    if (!user.mfaAtivado) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaAtivado: true },
      });
    }

    return { success: true, message: 'MFA validado com sucesso' };
  }

  async disable(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaAtivado: false,
        mfaSecret: null,
        mfaTipo: null,
      },
    });

    return { success: true, message: 'MFA desativado' };
  }
}
