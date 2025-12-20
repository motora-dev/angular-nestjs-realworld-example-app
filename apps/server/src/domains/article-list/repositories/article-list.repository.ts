import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleListRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticleList(): Promise<Article[]> {
    return await this.prisma.article.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
