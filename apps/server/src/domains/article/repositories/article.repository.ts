import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }

  async getFirstPageId(articleId: string): Promise<string | null> {
    const article = await this.prisma.article.findUnique({
      where: { publicId: articleId },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    if (!article || article.pages.length === 0) {
      return null;
    }

    return article.pages[0].publicId;
  }
}
