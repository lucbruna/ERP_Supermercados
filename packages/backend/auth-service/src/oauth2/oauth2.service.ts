import { Injectable, Logger, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class Oauth2Service {
  private readonly logger = new Logger(Oauth2Service.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async authorize(clientId: string, redirectUri: string, scope: string, userId?: string) {
    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });

    if (!client || !client.ativo) {
      throw new UnauthorizedException('Invalid client');
    }

    if (!client.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('Invalid redirect URI');
    }

    const requestedScopes = scope.split(' ').filter(Boolean);
    const validScopes = requestedScopes.filter((s) => client.scopes.includes(s));
    if (validScopes.length === 0) {
      throw new BadRequestException('No valid scopes requested');
    }

    const code = uuidv4();
    const authCode = crypto.createHash('sha256').update(code).digest('hex');

    await this.prisma.oAuthToken.create({
      data: {
        clientId: client.id,
        userId: userId || null,
        accessToken: '',
        scopes: validScopes,
        code: authCode,
        codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    this.logger.log(`Authorization code issued for client: ${client.name}`);

    return {
      success: true,
      code,
      redirectUri,
      scope: validScopes.join(' '),
    };
  }

  async token(authCode: string, clientSecret?: string, clientId?: string, redirectUri?: string, refreshToken?: string) {
    if (refreshToken) {
      return this.refreshToken(refreshToken);
    }

    if (!authCode || !clientSecret || !clientId) {
      throw new BadRequestException('Missing required parameters');
    }

    const client = await this.prisma.oAuthClient.findUnique({
      where: { clientId },
    });

    if (!client || !client.ativo) {
      throw new UnauthorizedException('Invalid client');
    }

    const secretValid = crypto.createHash('sha256').update(clientSecret).digest('hex') === client.clientSecret;
    if (!secretValid) {
      throw new UnauthorizedException('Invalid client secret');
    }

    const codeHash = crypto.createHash('sha256').update(authCode).digest('hex');

    const tokenRecord = await this.prisma.oAuthToken.findFirst({
      where: {
        code: codeHash,
        clientId: client.id,
        codeUsed: false,
        codeExpiresAt: { gte: new Date() },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }

    if (redirectUri && !client.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('Redirect URI mismatch');
    }

    const accessToken = this.jwtService.sign({
      sub: tokenRecord.userId || client.id,
      clientId: client.id,
      scopes: tokenRecord.scopes,
      type: 'oauth2_access',
    });

    const newRefreshToken = uuidv4();

    await this.prisma.oAuthToken.update({
      where: { id: tokenRecord.id },
      data: {
        codeUsed: true,
        accessToken: crypto.createHash('sha256').update(accessToken).digest('hex'),
        refreshToken: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    this.logger.log(`Tokens issued for client: ${client.name}`);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: tokenRecord.scopes.join(' '),
    };
  }

  async refreshToken(refreshToken: string) {
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const tokenRecord = await this.prisma.oAuthToken.findFirst({
      where: {
        refreshToken: refreshHash,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: { client: true },
    });

    if (!tokenRecord || !tokenRecord.client.ativo) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwtService.sign({
      sub: tokenRecord.userId || tokenRecord.clientId,
      clientId: tokenRecord.clientId,
      scopes: tokenRecord.scopes,
      type: 'oauth2_access',
    });

    const newRefreshToken = uuidv4();

    await this.prisma.oAuthToken.update({
      where: { id: tokenRecord.id },
      data: {
        accessToken: crypto.createHash('sha256').update(accessToken).digest('hex'),
        refreshToken: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: tokenRecord.scopes.join(' '),
    };
  }

  async introspect(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const tokenRecord = await this.prisma.oAuthToken.findFirst({
        where: {
          accessToken: tokenHash,
          revokedAt: null,
          expiresAt: { gte: new Date() },
        },
      });

      if (!tokenRecord) {
        return { active: false };
      }

      return {
        active: true,
        sub: payload.sub,
        client_id: payload.clientId,
        scopes: tokenRecord.scopes,
        token_type: 'Bearer',
        exp: Math.floor(tokenRecord.expiresAt.getTime() / 1000),
        iat: Math.floor(tokenRecord.createdAt.getTime() / 1000),
      };
    } catch {
      return { active: false };
    }
  }

  async revoke(token: string) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await this.prisma.oAuthToken.updateMany({
        where: {
          OR: [
            { accessToken: tokenHash },
            { refreshToken: tokenHash },
          ],
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      this.logger.log('Token revoked');

      return { success: true };
    } catch (error) {
      this.logger.error(`Token revocation error: ${error.message}`);
      return { success: true };
    }
  }

  async registerClient(name: string, redirectUris: string[], scopes: string[], grants: string[]) {
    const clientId = uuidv4();
    const clientSecret = uuidv4();
    const hashedSecret = crypto.createHash('sha256').update(clientSecret).digest('hex');

    const client = await this.prisma.oAuthClient.create({
      data: {
        name,
        clientId,
        clientSecret: hashedSecret,
        redirectUris,
        scopes,
        grants,
      },
    });

    this.logger.log(`OAuth2 client registered: ${name}`);

    return {
      client_id: client.clientId,
      client_secret: clientSecret,
      name: client.name,
      redirect_uris: client.redirectUris,
      scopes: client.scopes,
      grants: client.grants,
    };
  }
}
