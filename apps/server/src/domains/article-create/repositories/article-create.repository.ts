import { ArticleStatus } from '@monorepo/database/client';
import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import { generatePublicId } from '$utils';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleCreateRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async createArticle(userId: number): Promise<Article> {
    const newArticle = await this.prisma.article.findFirst({
      where: { userId, status: ArticleStatus.NEW },
    });

    if (newArticle) {
      return newArticle;
    }

    return await this.prisma.article.create({
      data: {
        publicId: generatePublicId(),
        userId: userId,
        title: '',
        description: '',
      },
    });
  }
}
