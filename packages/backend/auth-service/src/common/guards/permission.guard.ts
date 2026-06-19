import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<{ recurso: string; acao: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuário não autenticado');

    if (user.perfil === 'ADMIN_MASTER' || user.perfil === 'DIRETORIA') {
      return true;
    }

    const perm = await this.prisma.permission.findFirst({
      where: {
        perfil: user.perfil,
        departamento: user.departamento,
        recurso: permission.recurso,
        acao: { in: [permission.acao, 'TODOS'] },
      },
    });

    if (!perm) {
      throw new ForbiddenException('Acesso negado: permissão insuficiente');
    }

    return true;
  }
}
