import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ArticleEditRepository } from "$domains/article-edit/repositories";
import { ArticlePageEditRepository } from "$domains/article-page-edit/repositories";

import type { Page } from "@monorepo/database/client";

@Injectable()
export class ArticlePageEditService {
  constructor(
    private readonly articlePageEditRepository: ArticlePageEditRepository,
    private readonly articleEditRepository: ArticleEditRepository
  ) {}

  async getPages(userId: number, articleId: string): Promise<Page[]> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("Article edit forbidden");
    }

    return await this.articlePageEditRepository.getPages(article.id);
  }

  async getPage(
    userId: number,
    articleId: string,
    pageId: string
  ): Promise<Page> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("Article edit forbidden");
    }

    const page = await this.articlePageEditRepository.getPage(
      article.id,
      pageId
    );

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    return page;
  }

  async updatePage(
    userId: number,
    articleId: string,
    pageId: string,
    title: string,
    description: string,
    content: string
  ): Promise<Page> {
    const article = await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("Article edit forbidden");
    }

    const page = await this.articlePageEditRepository.getPage(
      article.id,
      pageId
    );

    if (!page) {
      throw new NotFoundException("Page not found");
    }

    return await this.articlePageEditRepository.updatePage(
      pageId,
      title,
      description,
      content
    );
  }
}
