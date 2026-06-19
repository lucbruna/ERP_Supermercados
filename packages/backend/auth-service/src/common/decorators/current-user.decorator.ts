import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  id: string;
  companyId: string;
  unidadeId?: string;
  email: string;
  perfil: string;
  departamento: string;
  nome: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof ICurrentUser | undefined, ctx: ExecutionContext): ICurrentUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as ICurrentUser;
    return data ? (user?.[data as keyof ICurrentUser] as string) : user;
  },
);
