import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetFeedQuery } from './get-feed.query';
import { MultipleArticlesDto } from '../../contracts';
import { ArticleListService } from '../../services/article-list.service';

@QueryHandler(GetFeedQuery)
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetFeedQuery): Promise<MultipleArticlesDto> {
    return this.service.getFeed(query.params, query.currentUserId);
  }
}
