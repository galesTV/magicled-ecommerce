import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario || usuario.tipoUsuario !== 'ADMIN') {
      throw new ForbiddenException('Acesso restrito a administradores.');
    }

    return true;
  }
}
