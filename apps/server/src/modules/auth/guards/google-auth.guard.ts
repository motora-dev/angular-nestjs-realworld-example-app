import { ERROR_CODE } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UnauthorizedError } from '$errors';
import { AuthService } from '../services/auth.service';

import type { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: Express.UserPayload;
}

/**
 * JWT Authentication Guard
 *
 * This guard checks if the user is authenticated via JWT access token in cookie.
 * If the access token is expired but refresh token is valid, it automatically
 * issues a new access token and sets it in the response cookie.
 *
 * Authentication flow:
 * 1. User logs in via GET /api/auth/login/google (redirects to Google)
 * 2. Google redirects to GET /api/auth/callback
 * 3. Server verifies Google token and issues JWT tokens (access + refresh)
 * 4. Subsequent requests are authenticated via access-token cookie
 * 5. When access token expires, guard automatically refreshes using refresh-token
 */
@Injectable()
export class GoogleAuthGuard implements CanActivate {
  private readonly isProd: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get('NODE_ENV') === 'production';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = request.cookies?.['access-token'];
    const refreshToken = request.cookies?.['refresh-token'];

    // 1. If access token exists and is valid, use it
    if (accessToken) {
      const payload = this.authService.verifyAccessToken(accessToken);
      if (payload) {
        request.user = {
          id: payload.id,
          publicId: payload.publicId,
          username: payload.username,
        };
        return true;
      }
    }

    // 2. Access token invalid/expired - try to refresh using refresh token
    if (refreshToken) {
      const user = await this.authService.validateRefreshToken(refreshToken);
      if (user) {
        // Generate new access token
        const newAccessToken = this.authService.generateAccessToken(user);

        // Set new access token in cookie
        response.cookie('access-token', newAccessToken, {
          httpOnly: true,
          secure: this.isProd,
          sameSite: 'lax',
          path: '/',
          maxAge: this.authService.getAccessTokenExpiryMs(),
        });

        // Attach user to request
        request.user = {
          id: user.id,
          publicId: user.publicId,
          username: user.username,
        };

        return true;
      }
    }

    // 3. Both tokens invalid/missing - unauthorized
    throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
  }
}
