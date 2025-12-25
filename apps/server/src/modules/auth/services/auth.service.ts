import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

import { AuthRepository } from '../repositories/auth.repository';

import type { JwtPayload, PendingRegistrationPayload } from '../contracts';
import type { User } from '@monorepo/database/client';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiryDays = 14;

  constructor(
    private authRepository: AuthRepository,
    private configService: ConfigService,
  ) {
    // Load RSA keys from environment variables (replace \n with actual newlines)
    const rawPrivateKey = this.configService.get<string>('JWT_PRIVATE_KEY') || '';
    const rawPublicKey = this.configService.get<string>('JWT_PUBLIC_KEY') || '';

    this.privateKey = rawPrivateKey.replace(/\\n/g, '\n');
    this.publicKey = rawPublicKey.replace(/\\n/g, '\n');
  }

  onModuleInit() {
    // Validate that keys are configured in production
    const isProd = this.configService.get('NODE_ENV') === 'production';
    if (isProd && (!this.privateKey || !this.publicKey)) {
      throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be configured in production');
    }
  }

  /**
   * Find user by OAuth provider credentials (no auto-creation)
   */
  async findUser(provider: string, sub: string): Promise<User | null> {
    return this.authRepository.findUserByProvider(provider, sub);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.authRepository.findUserByEmail(email);
  }

  /**
   * Find user by ID
   */
  async findUserById(id: number): Promise<User | null> {
    return this.authRepository.getUserById(id);
  }

  /**
   * Check if username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    return this.authRepository.isUsernameTaken(username);
  }

  /**
   * Register a new user with OAuth account
   */
  async registerUser(provider: string, sub: string, email: string, username: string): Promise<User> {
    return this.authRepository.createUser(provider, sub, email, username);
  }

  /**
   * Generate access token (short-lived JWT signed with RS256)
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      id: user.id,
      publicId: user.publicId,
      username: user.username,
    };
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Generate pending registration token (for new users during OAuth flow)
   */
  generatePendingRegistrationToken(provider: string, sub: string, email: string): string {
    const payload: PendingRegistrationPayload = { provider, sub, email };
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
    });
  }

  /**
   * Verify and decode pending registration token
   */
  verifyPendingRegistrationToken(token: string): PendingRegistrationPayload | null {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as PendingRegistrationPayload;
    } catch {
      return null;
    }
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate refresh token and save to database
   */
  async generateRefreshToken(userId: number): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiryDays);

    await this.authRepository.createRefreshToken(userId, token, expiresAt);
    return token;
  }

  /**
   * Validate refresh token and return user if valid
   */
  async validateRefreshToken(token: string): Promise<User | null> {
    const refreshToken = await this.authRepository.findRefreshToken(token);

    if (!refreshToken) {
      return null;
    }

    // Check if expired
    if (refreshToken.expiresAt < new Date()) {
      await this.authRepository.deleteRefreshToken(token);
      return null;
    }

    return refreshToken.user;
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(token);
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await this.authRepository.deleteAllRefreshTokens(userId);
  }

  /**
   * Get refresh token expiry in milliseconds (for cookie maxAge)
   */
  getRefreshTokenExpiryMs(): number {
    return this.refreshTokenExpiryDays * 24 * 60 * 60 * 1000;
  }

  /**
   * Get access token expiry in milliseconds (for cookie maxAge)
   */
  getAccessTokenExpiryMs(): number {
    return 15 * 60 * 1000; // 15 minutes
  }
}
