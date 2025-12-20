import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

import type { Page } from '@monorepo/database/client';

@Injectable()
export class ArticlePageEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async getPages(articleId: number): Promise<Page[]> {
    return await this.prisma.page.findMany({
      where: { articleId },
      orderBy: { order: 'asc' },
    });
  }

  async getPage(articleId: number, pageId: string): Promise<Page | null> {
    return await this.prisma.page.findFirst({
      where: { articleId, publicId: pageId },
    });
  }

  async updatePage(pageId: string, title: string, description: string, content: string): Promise<Page> {
    return await this.prisma.page.update({
      where: { publicId: pageId },
      data: { title, description, content },
    });
  }
}
