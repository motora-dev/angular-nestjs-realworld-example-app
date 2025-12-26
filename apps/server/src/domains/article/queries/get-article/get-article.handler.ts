import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleQuery } from './get-article.query';
import { ArticleService } from '../../services/article.service';

import type { SingleArticleDto } from '../../contracts';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetArticleQuery): Promise<SingleArticleDto> {
    return this.service.getArticle(query.slug, query.currentUserId);
  }
}
