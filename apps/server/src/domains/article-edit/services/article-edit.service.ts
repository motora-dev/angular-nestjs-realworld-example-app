import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ArticleEditRepository } from "$domains/article-edit/repositories";

import type { Article, Page } from "@monorepo/database/client";

@Injectable()
export class ArticleEditService {
  constructor(private readonly articleEditRepository: ArticleEditRepository) {}

  async getArticle(
    userId: number,
    articleId: string
  ): Promise<Article & { pages: Page[] }> {
    const article: Article | null =
      await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("Article edit forbidden");
    }

    const pages = await this.articleEditRepository.getPages(article.id);

    return { ...article, pages };
  }

  async updateArticle(
    userId: number,
    articleId: string,
    title: string,
    tags: string[],
    content: string
  ): Promise<Article> {
    const article: Article | null =
      await this.articleEditRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    if (article.userId !== userId) {
      throw new ForbiddenException("Article edit forbidden");
    }

    return await this.articleEditRepository.updateArticle(
      articleId,
      title,
      tags,
      content
    );
  }
}
