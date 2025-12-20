import { Injectable, NotFoundException } from "@nestjs/common";

import { ArticlePageRepository } from "../repositories";

import type { Article, Page } from "@monorepo/database/client";

@Injectable()
export class ArticlePageService {
  constructor(private readonly repository: ArticlePageRepository) {}

  async getPage(
    pageId: string
  ): Promise<{ page: Page & { article: Article }; pages: Page[] }> {
    const page = await this.repository.getPage(pageId);

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    const pages = await this.repository.getPagesByArticleId(page.articleId);

    return { page, pages };
  }
}
