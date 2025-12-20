import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticleEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getArticle(articleId: string): Promise<Article | null> {
    return await this.prisma.article.findUnique({
      where: { publicId: articleId },
    });
  }

  async getPages(articleId: number): Promise<Page[]> {
    return await this.prisma.page.findMany({
      where: { articleId },
      orderBy: { order: 'asc' },
    });
  }

  async updateArticle(articleId: string, title: string, tags: string[], description: string): Promise<Article> {
    return await this.prisma.article.update({
      where: { publicId: articleId },
      data: { title, tags, description },
    });
  }
}
