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
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import type { CurrentUserType } from '$decorators';
import { CurrentUser, Public } from '$decorators';
import { GoogleAuthGuard } from '$guards';
import { AuthService } from './services/auth.service';

import type { Request, Response } from 'express';

interface UserResponse {
  id: string; // publicId
  username: string;
}

interface RegisterDto {
  username: string;
}

interface RegisterResponse {
  id: string; // publicId
  username: string;
  email: string;
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
   * If user exists, sets session and redirects to home.
   * If user does not exist, stores Google info in session and redirects to register page.
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

      // Check if user exists
      const user = await this.authService.findUser('google', payload.sub);

      if (user) {
        // User exists - set session and redirect to callback
        req.session.user = {
          id: user.id,
          publicId: user.publicId,
          username: user.username,
        };
        res.redirect(`${clientUrl}/auth/callback?isNewUser=false`);
      } else {
        // User does not exist - store Google info in session for registration
        req.session.pendingRegistration = {
          provider: 'google',
          sub: payload.sub,
          email: payload.email,
        };
        res.redirect(`${clientUrl}/auth/callback?isNewUser=true&email=${encodeURIComponent(payload.email)}`);
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
  }

  /**
   * Register a new user.
   * Uses pending registration data from session (set during OAuth callback).
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto, @Req() req: Request): Promise<RegisterResponse> {
    const { username } = body;

    // Validate username
    if (!username || username.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters');
    }

    // Username format validation (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Username can only contain letters, numbers, and underscores');
    }

    // Get pending registration from session
    const pending = req.session.pendingRegistration;
    if (!pending) {
      throw new BadRequestException('No pending registration found. Please start the login process again.');
    }

    // Check if username is already taken
    const isUsernameTaken = await this.authService.isUsernameTaken(username);
    if (isUsernameTaken) {
      throw new BadRequestException('Username is already taken');
    }

    // Check if email is already registered
    const existingUser = await this.authService.findUserByEmail(pending.email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    // Create user
    const user = await this.authService.registerUser(pending.provider, pending.sub, pending.email, username);

    // Clear pending registration
    delete req.session.pendingRegistration;

    // Set user session
    req.session.user = {
      id: user.id,
      publicId: user.publicId,
      username: user.username,
    };

    return {
      id: user.publicId,
      username: user.username,
      email: user.email,
    };
  }

  /**
   * Get pending registration email.
   * Used by the register page to display the email from Google.
   */
  @Public()
  @Get('pending-registration')
  @HttpCode(HttpStatus.OK)
  async getPendingRegistration(@Req() req: Request): Promise<{ email: string } | null> {
    const pending = req.session.pendingRegistration;
    if (!pending) {
      return null;
    }
    return { email: pending.email };
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
      id: user.publicId,
      username: user.username,
    };
  }
}
