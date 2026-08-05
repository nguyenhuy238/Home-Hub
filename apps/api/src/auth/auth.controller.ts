import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import type { AuthenticatedRequest } from '../common/auth.types';

const accessCookie = 'homehub_access';
const refreshCookie = 'homehub_refresh';
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(input);
    this.setCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
    return { data: result.identity };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(request.cookies?.[refreshCookie]);
    this.setCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
    return { data: result.identity };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.revoke(request.cookies?.[refreshCookie]);
    response.clearCookie(accessCookie, cookieOptions);
    response.clearCookie(refreshCookie, cookieOptions);
    return { data: null };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { data: request.auth };
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(accessCookie, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie(refreshCookie, refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
}
