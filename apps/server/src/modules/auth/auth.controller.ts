import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OAuth2Client } from 'google-auth-library';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import {
  ProcessOAuthCallbackCommand,
  RefreshAccessTokenCommand,
  RegisterUserCommand,
  RevokeRefreshTokenCommand,
} from './commands';
import { GoogleAuthGuard } from './guards';
import { GetCurrentAuthUserQuery, GetPendingRegistrationQuery } from './queries';
import { AuthService } from './services';

import type { ProcessOAuthCallbackResult } from './commands/process-oauth-callback/process-oauth-callback.handler';
import type { RefreshAccessTokenResult } from './commands/refresh-access-token/refresh-access-token.handler';
import type { RegisterUserResult } from './commands/register-user/register-user.handler';
import type { RegisterDto, UserResponse } from './contracts';
import type { PendingRegistrationResult } from './queries/get-pending-registration/get-pending-registration.handler';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly googleClient: OAuth2Client;
  private readonly isProd: boolean;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
    this.isProd = this.configService.get('NODE_ENV') === 'production';
  }

  /**
   * Set authentication cookies (access token and refresh token)
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: this.authService.getAccessTokenExpiryMs(),
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/api/auth', // Only sent to auth endpoints
      maxAge: this.authService.getRefreshTokenExpiryMs(),
    });
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(res: Response): void {
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/api/auth',
    });

    res.clearCookie('pending-registration', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * Initiates Google OAuth login flow.
   * Redirects the user to Google's OAuth consent page.
   */
  @Get('login/google')
  async loginGoogle(@Res() res: Response): Promise<void> {
    const authorizeUrl = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
    });

    res.redirect(authorizeUrl);
  }

  /**
   * Handles Google OAuth callback.
   * If user exists, sets JWT cookies and redirects to home.
   * If user does not exist, sets pending registration token and redirects to register page.
   */
  @Get('callback')
  async callback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response): Promise<void> {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:4200';

    // Handle OAuth error (user denied access, etc.)
    if (error) {
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code) {
      res.redirect(`${clientUrl}/login?error=no_code`);
      return;
    }

    // Exchange authorization code for tokens
    const { tokens } = await this.googleClient.getToken(code);

    if (!tokens.id_token) {
      res.redirect(`${clientUrl}/login?error=no_id_token`);
      return;
    }

    // Verify the ID token
    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      res.redirect(`${clientUrl}/login?error=invalid_token`);
      return;
    }

    // Process OAuth callback via CommandBus
    const result: ProcessOAuthCallbackResult = await this.commandBus.execute(
      new ProcessOAuthCallbackCommand('google', payload.sub, payload.email),
    );

    if (result.type === 'login') {
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
      res.redirect(clientUrl);
    } else {
      res.cookie('pending-registration', result.pendingToken, {
        httpOnly: true,
        secure: this.isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      res.redirect(`${clientUrl}/register`);
    }
  }

  /**
   * Register a new user.
   * Uses pending registration token from cookie (set during OAuth callback).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const pendingToken = req.cookies?.['pending-registration'];
    if (!pendingToken) {
      throw new BadRequestException('No pending registration found. Please start the login process again.');
    }

    const result: RegisterUserResult = await this.commandBus.execute(
      new RegisterUserCommand(pendingToken, body.username),
    );

    // Clear pending registration cookie
    res.clearCookie('pending-registration', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
    });

    // Set auth cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Send response
    res.status(HttpStatus.CREATED).json(result.response);
  }

  /**
   * Get pending registration email.
   * Used by the register page to display the email from Google.
   */
  @Get('pending-registration')
  @HttpCode(HttpStatus.OK)
  async getPendingRegistration(@Req() req: Request): Promise<PendingRegistrationResult | null> {
    const pendingToken = req.cookies?.['pending-registration'];
    return this.queryBus.execute(new GetPendingRegistrationQuery(pendingToken));
  }

  /**
   * Refresh access token using refresh token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.['refresh-token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result: RefreshAccessTokenResult | null = await this.commandBus.execute(
      new RefreshAccessTokenCommand(refreshToken),
    );

    if (!result) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Set new access token cookie
    res.cookie('access-token', result.accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: this.authService.getAccessTokenExpiryMs(),
    });

    res.json({ success: true });
  }

  /**
   * Logout endpoint.
   * Revokes refresh token and clears cookies.
   * No authentication required - just clears cookies and revokes token if present.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies?.['refresh-token'];

    // Revoke refresh token via CommandBus
    await this.commandBus.execute(new RevokeRefreshTokenCommand(refreshToken));

    // Clear all auth cookies
    this.clearAuthCookies(res);

    res.json({ success: true });
  }

  /**
   * Get current user endpoint.
   * Returns the authenticated user's information.
   */
  @UseGuards(GoogleAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: CurrentUserType): Promise<UserResponse> {
    return this.queryBus.execute(new GetCurrentAuthUserQuery(user));
  }
}
