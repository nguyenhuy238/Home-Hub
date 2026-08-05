import { createHash, randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthIdentity } from '../common/auth.types';
import type { LoginDto } from './dto/login.dto';

interface TokenPayload extends JWTPayload {
  sub: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async login(input: LoginDto): Promise<{ identity: AuthIdentity; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() }, include: { membership: { include: { store: true } } } });
    if (!user || user.status !== UserStatus.ACTIVE || !(await compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return { identity: this.toIdentity(user), tokens: await this.issueTokens(user.id) };
  }

  async identityFromAccessToken(token: string): Promise<AuthIdentity> {
    const payload = await this.verify(token, this.secret('ACCESS_TOKEN_SECRET'));
    if (payload.type !== 'access') throw new UnauthorizedException('Access token không hợp lệ');
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { membership: { include: { store: true } } } });
    if (!user || user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Tài khoản không còn hoạt động');
    return this.toIdentity(user);
  }

  async refresh(refreshToken: string): Promise<{ identity: AuthIdentity; tokens: AuthTokens }> {
    const payload = await this.verify(refreshToken, this.secret('REFRESH_TOKEN_SECRET'));
    if (payload.type !== 'refresh') throw new UnauthorizedException('Refresh token không hợp lệ');
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: { include: { membership: { include: { store: true } } } } } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return { identity: this.toIdentity(stored.user), tokens: await this.issueTokens(stored.user.id) };
  }

  async revoke(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await this.prisma.refreshToken.updateMany({ where: { tokenHash: this.hashToken(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async createPasswordHash(password: string): Promise<string> {
    return hash(password, 12);
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const accessExpiresIn = 15 * 60;
    const refreshExpiresIn = 30 * 24 * 60 * 60;
    const accessToken = await this.sign({ sub: userId, type: 'access' }, this.secret('ACCESS_TOKEN_SECRET'), accessExpiresIn);
    const refreshToken = await this.sign({ sub: userId, type: 'refresh' }, this.secret('REFRESH_TOKEN_SECRET'), refreshExpiresIn);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash: this.hashToken(refreshToken), expiresAt: new Date(Date.now() + refreshExpiresIn * 1000) } });
    return { accessToken, refreshToken, accessExpiresIn };
  }

  private toIdentity(user: { id: string; email: string; isPlatformAdmin: boolean; membership: { role: 'OWNER'; storeId: string; store: { status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' } } | null }): AuthIdentity {
    return { userId: user.id, email: user.email, isPlatformAdmin: user.isPlatformAdmin, role: user.membership?.role ?? null, storeId: user.membership?.storeId ?? null, storeStatus: user.membership?.store.status ?? null };
  }

  private async sign(payload: TokenPayload, secret: Uint8Array, expiresIn: number): Promise<string> {
    return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setJti(randomUUID()).setExpirationTime(`${expiresIn}s`).sign(secret);
  }

  private async verify(token: string, secret: Uint8Array): Promise<TokenPayload> {
    try {
      const result = await jwtVerify<TokenPayload>(token, secret, { algorithms: ['HS256'] });
      return result.payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private secret(name: 'ACCESS_TOKEN_SECRET' | 'REFRESH_TOKEN_SECRET'): Uint8Array {
    const value = this.config.get<string>(name);
    if (!value || value.length < 32) throw new Error(`${name} must be at least 32 characters`);
    return new TextEncoder().encode(value);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
