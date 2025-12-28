import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCommentsQuery } from '$domains/article/queries/get-comments/get-comments.query';
import { ArticleService } from '$domains/article/services/article.service';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetCommentsQuery) {
    return this.service.getComments(query.slug, query.currentUserId);
  }
}
