import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleQuery } from './get-article.query';
import { GetArticleResponse } from '../../dto';
import { ArticleService } from '../../services';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly articleService: ArticleService) {}

  async execute(query: GetArticleQuery): Promise<GetArticleResponse> {
    const article = await this.articleService.getArticle(query.articleId);
    return {
      id: article.publicId,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      title: article.title,
      tags: article.tags,
      description: article.description ?? '',
    };
  }
}
