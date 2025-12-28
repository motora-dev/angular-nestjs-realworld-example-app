import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleQuery } from '$domains/article/queries/get-article/get-article.query';
import { ArticleService } from '$domains/article/services/article.service';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetArticleQuery) {
    return this.service.getArticle(query.slug, query.currentUserId);
  }
}
