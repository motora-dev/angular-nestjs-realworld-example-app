import { Injectable } from '@nestjs/common';

import { ArticleListDto } from '../dto';
import { ArticleListRepository } from '../repositories';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleListService {
  constructor(private readonly articleListRepository: ArticleListRepository) {}

  async getArticleList(): Promise<ArticleListDto> {
    const articles: Article[] = await this.articleListRepository.getArticleList();

    return {
      articleList: articles.map((article) => ({
        id: article.publicId,
        title: article.title ?? '',
        tags: article.tags,
        createdAt: article.createdAt,
      })),
    };
  }
}
