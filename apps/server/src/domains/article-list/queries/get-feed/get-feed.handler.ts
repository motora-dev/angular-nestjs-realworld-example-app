import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { MultipleArticlesDto } from '../../dto';
import { ArticleListService } from '../../services/article-list.service';
import { GetFeedQuery } from './get-feed.query';

@QueryHandler(GetFeedQuery)
export class GetFeedHandler implements IQueryHandler<GetFeedQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute(query: GetFeedQuery): Promise<MultipleArticlesDto> {
    return this.service.getFeed(query.params, query.currentUserId);
  }
}
