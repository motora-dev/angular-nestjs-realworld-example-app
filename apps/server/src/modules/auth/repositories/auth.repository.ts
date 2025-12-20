import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$utils';

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

  async findOrCreateUser(provider: string, sub: string, email: string): Promise<User> {
    const existUser = await this.getUserByProvider(provider, sub);
    if (existUser) {
      return existUser;
    }

    // 2. まず子テーブル(Account)をemailで検索し、関連するUserを取得
    const accountWithEmail = await this.prisma.account.findFirst({
      where: { email },
      include: { user: true },
    });

    // 3. 紐づくべきUserがAccount経由で見つかった場合
    if (accountWithEmail) {
      // そのUserに新しいAccountを紐付ける
      await this.prisma.account.create({
        data: { publicId: generatePublicId(), provider, sub, email, userId: accountWithEmail.userId },
      });
      return accountWithEmail.user;
    }

    // 4. Account経由で見つからなかった場合、Userのプライマリemailを基準にupsert
    //    これにより「UserがいればAccountを追加」「いなければUserごと作成」を一度に行う
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
