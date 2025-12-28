import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetTagsQuery } from '$domains/article-list/queries/get-tags/get-tags.query';
import { ArticleListService } from '$domains/article-list/services/article-list.service';

@QueryHandler(GetTagsQuery)
export class GetTagsHandler implements IQueryHandler<GetTagsQuery> {
  constructor(private readonly service: ArticleListService) {}

  async execute() {
    return this.service.getTags();
  }
}
