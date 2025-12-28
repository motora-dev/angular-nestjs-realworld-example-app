import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$shared/utils/id-generator';

import type { RefreshToken, User } from '@monorepo/database/client';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaAdapter) {}

  async getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async getUserByProvider(provider: string, sub: string): Promise<User | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_sub: {
          provider,
          sub,
        },
      },
      include: {
        user: true, // Also fetch related User information
      },
    });

    return account?.user ?? null;
  }

  /**
   * Find user by OAuth provider credentials only (no auto-creation)
   */
  async findUserByProvider(provider: string, sub: string): Promise<User | null> {
    return this.getUserByProvider(provider, sub);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Check if username is already taken
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user !== null;
  }

  /**
   * Create a new user with OAuth account (explicit registration)
   */
  async createUser(provider: string, sub: string, email: string, username: string): Promise<User> {
    const publicId = generatePublicId();

    return this.prisma.user.create({
      data: {
        publicId,
        email,
        username,
        accounts: {
          create: { provider, sub, email },
        },
      },
    });
  }

  /**
   * Create a new refresh token
   */
  async createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Find a refresh token by token string
   */
  async findRefreshToken(token: string): Promise<(RefreshToken & { user: User }) | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Delete a refresh token by token string
   */
  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Delete all refresh tokens for a user
   */
  async deleteAllRefreshTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired refresh tokens (cleanup)
   */
  async deleteExpiredRefreshTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
