import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$utils';

import type { User } from '@monorepo/database/client';

@Injectable()
export class UserRepository {
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
        user: true,
      },
    });

    return account?.user ?? null;
  }

  async findOrCreateUser(provider: string, sub: string, email: string): Promise<User> {
    // メールアドレスで既存のアカウントを検索
    const accountWithEmail = await this.prisma.account.findFirst({
      where: { email },
      include: { user: true },
    });

    // 既存のユーザーに新しいアカウントを紐付け
    if (accountWithEmail) {
      await this.prisma.account.create({
        data: { publicId: generatePublicId(), provider, sub, email, userId: accountWithEmail.userId },
      });
      return accountWithEmail.user;
    }

    // 新規ユーザーとアカウントを作成
    return this.prisma.user.upsert({
      where: { email },
      update: {
        accounts: {
          create: { publicId: generatePublicId(), provider, sub, email },
        },
      },
      create: {
        publicId: generatePublicId(),
        email,
        accounts: {
          create: { publicId: generatePublicId(), provider, sub, email },
        },
      },
    });
  }
}
