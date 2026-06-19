import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (recurso: string, acao: string) =>
  SetMetadata(PERMISSION_KEY, { recurso, acao });
