import { Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$guards';
import { AuthService } from './services/auth.service';

import type { Request, Response } from 'express';

interface UserResponse {
  id: number;
  username: string;
}

@Controller('api/auth')
export class AuthController {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
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
   * Exchanges authorization code for tokens, creates/finds user, sets session,
   * and redirects to the client application.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
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

    try {
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

      // Find or create user in database
      const user = await this.authService.findOrCreateUser('google', payload.sub, payload.email);

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username,
      };

      // Redirect to client callback page
      res.redirect(`${clientUrl}/auth/callback`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
  }

  /**
   * Logout endpoint.
   * Destroys the session and clears cookies.
   */
  @UseGuards(GoogleAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  /**
   * Get current user endpoint.
   * Returns the authenticated user's information.
   */
  @UseGuards(GoogleAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: CurrentUserType): Promise<UserResponse> {
    return {
      id: user.id,
      username: user.username,
    };
  }
}
