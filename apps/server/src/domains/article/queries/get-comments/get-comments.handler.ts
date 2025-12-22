import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { MultipleCommentsDto } from '../../dto';
import { ArticleService } from '../../services/article.service';
import { GetCommentsQuery } from './get-comments.query';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(private readonly service: ArticleService) {}

  async execute(query: GetCommentsQuery): Promise<MultipleCommentsDto> {
    return this.service.getComments(query.slug, query.currentUserId);
  }
}
