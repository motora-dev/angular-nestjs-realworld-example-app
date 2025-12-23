import { ERROR_CODE } from '@monorepo/error-code';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { UnauthorizedError } from '$errors';

import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: Express.UserPayload;
}

/**
 * Google Authentication Guard
 *
 * This guard checks if the user is authenticated via session.
 * It uses express-session to manage user state after Google OAuth login.
 *
 * Authentication flow:
 * 1. User logs in via GET /api/auth/login/google (redirects to Google)
 * 2. Google redirects to GET /api/auth/callback
 * 3. Server verifies token and creates session
 * 4. Subsequent requests are authenticated via session cookie
 */
@Injectable()
export class GoogleAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Check if user is authenticated via session
    if (request.session?.user) {
      // Attach user to request for use in controllers
      request.user = request.session.user;
      return true;
    }

    // Not authenticated
    throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
  }
}
