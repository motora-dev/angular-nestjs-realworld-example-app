import { Injectable, NotFoundException } from "@nestjs/common";

import { ArticleRepository } from "../repositories";

import type { Article } from "@monorepo/database/client";

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getArticle(articleId: string): Promise<Article> {
    const article: Article | null =
      await this.articleRepository.getArticle(articleId);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return article;
  }

  async getFirstPageId(articleId: string): Promise<string> {
    const firstPageId = await this.articleRepository.getFirstPageId(articleId);

    if (!firstPageId) {
      throw new NotFoundException("Article not found for page");
    }

    return firstPageId;
  }
}
