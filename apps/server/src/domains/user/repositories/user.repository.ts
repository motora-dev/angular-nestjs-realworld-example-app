import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import {
  userWithAccountSelect,
  type CreateUserParams,
  type UpdateUserParams,
  type UserWithAccount,
} from '$domains/user/contracts';
import { generatePublicId } from '$shared/utils/id-generator';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get user by id
   */
  async getById(id: number): Promise<UserWithAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userWithAccountSelect,
    });

    return user;
  }

  /**
   * Get user by username
   */
  async getByUsername(username: string): Promise<UserWithAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: userWithAccountSelect,
    });

    return user;
  }

  /**
   * Get user by OAuth account
   */
  async getByOAuthAccount(provider: string, providerId: string): Promise<UserWithAccount | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_sub: {
          provider,
          sub: providerId,
        },
      },
      include: {
        user: {
          select: userWithAccountSelect,
        },
      },
    });

    return account?.user || null;
  }

  /**
   * Create user with OAuth account
   */
  async create(params: CreateUserParams): Promise<UserWithAccount> {
    const publicId = generatePublicId();

    const user = await this.prisma.user.create({
      data: {
        publicId,
        email: params.email,
        username: params.username,
        image: params.image,
        accounts: {
          create: {
            provider: params.provider,
            sub: params.providerId,
            email: params.email,
          },
        },
      },
      select: userWithAccountSelect,
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id: number, params: UpdateUserParams): Promise<UserWithAccount> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: params.email,
        username: params.username,
        bio: params.bio,
        image: params.image,
      },
      select: userWithAccountSelect,
    });

    return user;
  }

  /**
   * Check if username is taken (excluding current user)
   */
  async isUsernameTaken(username: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        id: excludeUserId ? { not: excludeUserId } : undefined,
      },
    });

    return !!user;
  }

  /**
   * Check if email is taken (excluding current user)
   */
  async isEmailTaken(email: string, excludeUserId?: number): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        id: excludeUserId ? { not: excludeUserId } : undefined,
      },
    });

    return !!user;
  }
}
