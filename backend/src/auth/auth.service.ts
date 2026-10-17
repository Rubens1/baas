import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from '../entities/AuthSession.js';
import { Merchant } from '../entities/Merchant.js';

const scrypt = promisify(scryptCallback);
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchants: Repository<Merchant>,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
  ) {}

  async login(email: string, password: string) {
    const merchant = await this.merchants.findOne({ where: { email: email.toLowerCase() } });
    if (!merchant || !(await this.passwordMatches(password, merchant))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await this.sessions.save(
      this.sessions.create({
        merchantId: merchant.id,
        tokenHash: this.hashToken(token),
        expiresAt,
      }),
    );

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresAt,
      merchant: { id: merchant.id, name: merchant.name, email: merchant.email },
    };
  }

  async getMerchantForToken(token: string): Promise<string | undefined> {
    const session = await this.sessions.findOne({
      where: { tokenHash: this.hashToken(token) },
    });
    if (!session || session.expiresAt.getTime() <= Date.now()) return undefined;
    return session.merchantId;
  }

  async logout(token: string): Promise<void> {
    await this.sessions.delete({ tokenHash: this.hashToken(token) });
  }

  async passwordMatches(password: string, merchant: Merchant): Promise<boolean> {
    const hash = (await scrypt(password, merchant.passwordSalt, 64)) as Buffer;
    const expected = Buffer.from(merchant.passwordHash, 'hex');
    return hash.length === expected.length && timingSafeEqual(hash, expected);
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async hashPassword(password: string): Promise<{ passwordHash: string; passwordSalt: string }> {
    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = ((await scrypt(password, passwordSalt, 64)) as Buffer).toString('hex');
    return { passwordHash, passwordSalt };
  }
}
