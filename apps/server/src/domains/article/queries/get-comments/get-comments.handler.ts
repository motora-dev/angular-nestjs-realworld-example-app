import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCommentsQuery } from './get-comments.query';
import { ArticleService } from '../../services/article.service';

import type { MultipleCommentsDto } from '../../contracts';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetCommentsQuery): Promise<MultipleCommentsDto> {
    return this.service.getComments(query.slug, query.currentUserId);
  }
}
