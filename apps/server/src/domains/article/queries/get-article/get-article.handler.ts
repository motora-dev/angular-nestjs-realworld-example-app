import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { SingleArticleDto } from '../../dto';
import { ArticleService } from '../../services/article.service';
import { GetArticleQuery } from './get-article.query';

@QueryHandler(GetArticleQuery)
export class GetArticleHandler implements IQueryHandler<GetArticleQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetArticleQuery): Promise<SingleArticleDto> {
    return this.service.getArticle(query.slug, query.currentUserId);
  }
}
