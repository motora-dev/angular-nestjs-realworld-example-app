import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ArticleListService } from '$domains/article-list/services/article-list.service';
import { GetArticlesQuery } from './get-articles.query';

@QueryHandler(GetArticlesQuery)
export class GetArticlesHandler implements IQueryHandler<GetArticlesQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetArticlesQuery) {
    // 戻り値型を明示しないことで、Query<MultipleArticlesDto> の型が変われば自動で追従
    return this.service.getArticles(query.params, query.currentUserId);
  }
}
