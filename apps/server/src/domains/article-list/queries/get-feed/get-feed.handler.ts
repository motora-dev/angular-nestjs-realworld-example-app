import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetFeedQuery } from '$domains/article-list/queries/get-feed/get-feed.query';
import { ArticleListService } from '$domains/article-list/services/article-list.service';

@QueryHandler(GetFeedQuery)
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetFeedQuery) {
    return this.service.getFeed(query.params, query.currentUserId);
  }
}
