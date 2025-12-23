import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$shared/utils/id-generator';

import type { User } from '@monorepo/database/client';

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
        user: true, // 関連するUser情報も一緒に取得
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
}
