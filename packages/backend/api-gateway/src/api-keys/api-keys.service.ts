import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private prisma: PrismaService) {}

  private generateRawKey(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  private getKeyPrefix(rawKey: string): string {
    return rawKey.substring(0, 12) + '...';
  }

  async generateKey(name: string, permissions: string = 'read', tier: string = 'standard', expiresInDays?: number) {
    const rawKey = this.generateRawKey();
    const keyHash = this.hashKey(rawKey);
    const keyPrefix = this.getKeyPrefix(rawKey);

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        permissions,
        tier,
        expiresAt,
      },
    });

    this.logger.log(`API key generated: ${name} (${apiKey.id})`);

    return {
      id: apiKey.id,
      name: apiKey.name,
      rawKey,
      keyPrefix: apiKey.keyPrefix,
      permissions: apiKey.permissions,
      tier: apiKey.tier,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async validateKey(key: string) {
    const keyHash = this.hashKey(key);

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey) {
      return null;
    }

    if (!apiKey.ativo) {
      this.logger.warn(`API key revoked attempt: ${apiKey.name} (${apiKey.id})`);
      return null;
    }

    if (apiKey.revokedAt) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      this.logger.warn(`API key expired: ${apiKey.name} (${apiKey.id})`);
      return null;
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
      tier: apiKey.tier,
    };
  }

  async revokeKey(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { ativo: false, revokedAt: new Date() },
    });

    this.logger.log(`API key revoked: ${apiKey.name} (${id})`);

    return { success: true, message: 'API key revoked successfully' };
  }

  async listKeys() {
    const keys = await this.prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        tier: true,
        ativo: true,
        expiresAt: true,
        revokedAt: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return keys;
  }

  async getKeyDetails(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        tier: true,
        ativo: true,
        expiresAt: true,
        revokedAt: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }
}
