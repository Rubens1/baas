import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Headers('authorization') authorization?: string) {
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException('Token de sessão obrigatório.');

    await this.auth.logout(token);
    return { success: true };
  }
}
