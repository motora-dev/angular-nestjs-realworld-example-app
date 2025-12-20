import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Article, Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getPage(pageId: string): Promise<(Page & { article: Article }) | null> {
    return await this.prisma.page.findUnique({
      where: { publicId: pageId },
      include: {
        article: true,
      },
    });
  }

  async getPagesByArticleId(articleInternalId: number): Promise<Page[]> {
    return await this.prisma.page.findMany({
      where: { articleId: articleInternalId },
      orderBy: { order: 'asc' },
    });
  }
}
