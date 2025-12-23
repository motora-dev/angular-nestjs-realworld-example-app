import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticlesQuery } from './get-articles.query';
import { MultipleArticlesDto } from '../../contracts';
import { ArticleListService } from '../../services/article-list.service';

@QueryHandler(GetArticlesQuery)
export class GetArticlesHandler implements IQueryHandler<GetArticlesQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetArticlesQuery): Promise<MultipleArticlesDto> {
    return this.service.getArticles(query.params, query.currentUserId);
  }
}
