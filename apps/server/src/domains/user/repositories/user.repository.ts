import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

export interface UserWithAccount {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
}

export interface CreateUserParams {
  provider: string;
  providerId: string;
  email: string;
  username: string;
  image?: string;
}

export interface UpdateUserParams {
  email?: string;
  username?: string;
  bio?: string;
  image?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get user by id
   */
  async getById(id: number): Promise<UserWithAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return user;
  }

  /**
   * Get user by username
   */
  async getByUsername(username: string): Promise<UserWithAccount | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return user;
  }

  /**
   * Get user by OAuth account
   */
  async getByOAuthAccount(
    provider: string,
    providerId: string,
  ): Promise<UserWithAccount | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return account?.user || null;
  }

  /**
   * Create user with OAuth account
   */
  async create(params: CreateUserParams): Promise<UserWithAccount> {
    const user = await this.prisma.user.create({
      data: {
        email: params.email,
        username: params.username,
        image: params.image,
        accounts: {
          create: {
            type: 'oauth',
            provider: params.provider,
            providerAccountId: params.providerId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
      },
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
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return user;
  }

  /**
   * Check if username is taken (excluding current user)
   */
  async isUsernameTaken(
    username: string,
    excludeUserId?: number,
  ): Promise<boolean> {
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
