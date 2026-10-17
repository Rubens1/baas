import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      merchantId?: string;
    }>();
    const authorization = request.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Bearer token é obrigatório.');

    const merchantId = await this.auth.getMerchantForToken(token);
    if (!merchantId) throw new UnauthorizedException('Sessão inválida ou expirada.');
    request.merchantId = merchantId;
    return true;
  }
}
