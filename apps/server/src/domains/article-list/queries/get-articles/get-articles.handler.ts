import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ArticleListService } from '$domains/article-list/services/article-list.service';
import { GetArticlesQuery } from './get-articles.query';

@QueryHandler(GetArticlesQuery)
export class GetArticlesHandler implements IQueryHandler<GetArticlesQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetArticlesQuery) {
    // Omit explicit return type to automatically follow changes in Query<MultipleArticlesDto> type
    return this.service.getArticles(query.params, query.currentUserId);
  }
}
