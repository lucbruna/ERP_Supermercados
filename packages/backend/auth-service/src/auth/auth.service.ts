import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true, unidade: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!user.ativo) {
      throw new UnauthorizedException('Usuário desativado');
    }

    if (user.bloqueadoAte && user.bloqueadoAte > new Date()) {
      throw new UnauthorizedException(
        `Conta bloqueada até ${user.bloqueadoAte.toISOString()}`,
      );
    }

    const senhaValida = await bcrypt.compare(dto.senha, user.senha);
    if (!senhaValida) {
      await this.handleFailedLogin(user.id);
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { tentativasLogin: 0, bloqueadoAte: null, ultimoAcesso: new Date() },
    });

    const tokens = await this.generateTokens(user);

    if (user.mfaAtivado) {
      return {
        success: true,
        requiresMfa: true,
        mfaTipo: user.mfaTipo,
        sessionId: tokens.sessionId,
        message: 'Autenticação multifator necessária',
      };
    }

    await this.registerSession(user.id, tokens, dto);

    return {
      success: true,
      requiresMfa: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateMfa(userId: string, mfaCode: string, sessionId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA não configurado');
    }

    if (user.mfaTipo === 'TOTP') {
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 2,
      });

      if (!verified) {
        throw new UnauthorizedException('Código MFA inválido');
      }
    } else if (user.mfaTipo === 'FACE_ID' || user.mfaTipo === 'BIOMETRIA') {
      const redisKey = `mfa:pending:${sessionId}`;
      const stored = await this.redis.get(redisKey);
      if (!stored || stored !== mfaCode) {
        throw new UnauthorizedException('Validação biométrica falhou');
      }
      await this.redis.del(redisKey);
    }

    await this.prisma.sessao.update({
      where: { id: sessionId },
      data: { mfaValidado: true },
    });

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.sessao.findUnique({
      where: { refreshToken },
      include: { user: { include: { company: true } } },
    });

    if (!session || !session.ativo || session.dataExpiracao < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const tokens = await this.generateTokens(session.user);

    await this.prisma.sessao.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        dataExpiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.prisma.sessao.update({
        where: { id: sessionId },
        data: { ativo: false, dataFim: new Date() },
      });
    } else {
      await this.prisma.sessao.updateMany({
        where: { userId, ativo: true },
        data: { ativo: false, dataFim: new Date() },
      });
    }
    return { success: true, message: 'Logout realizado com sucesso' };
  }

  async setupMfa(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `ERP Supermercado (${userId.slice(0, 8)})`,
      length: 20,
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret.base32,
        mfaTipo: 'TOTP',
        mfaAtivado: true,
      },
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Escaneie o QR Code com seu aplicativo autenticador',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true, unidade: true },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return { success: true, user: this.sanitizeUser(user) };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      unidadeId: user.unidadeId,
      perfil: user.perfil,
      departamento: user.departamento,
      nome: user.nome,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const sessionId = uuidv4();

    return { accessToken, refreshToken, sessionId };
  }

  private async registerSession(userId: string, tokens: any, dto: LoginDto) {
    await this.prisma.sessao.create({
      data: {
        id: tokens.sessionId,
        userId,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ip: dto.ip || '0.0.0.0',
        dispositivo: dto.dispositivo || 'unknown',
        userAgent: dto.userAgent || 'unknown',
        dataExpiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  private async handleFailedLogin(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { tentativasLogin: { increment: 1 } },
    });

    if (user.tentativasLogin >= 5) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          bloqueadoAte: new Date(Date.now() + 30 * 60 * 1000),
          tentativasLogin: 0,
        },
      });
    }
  }

  private sanitizeUser(user: any) {
    const { senha, salt, mfaSecret, ...sanitized } = user;
    return sanitized;
  }
}
