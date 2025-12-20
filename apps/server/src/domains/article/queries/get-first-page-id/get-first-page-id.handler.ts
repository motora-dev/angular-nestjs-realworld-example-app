import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetFirstPageIdQuery } from './get-first-page-id.query';
import { GetFirstPageIdResponse } from '../../dto';
import { ArticleService } from '../../services';

@QueryHandler(GetFirstPageIdQuery)
export class GetFirstPageIdHandler implements IQueryHandler<GetFirstPageIdQuery> {
  constructor(private readonly articleService: ArticleService) {}

  async execute(query: GetFirstPageIdQuery): Promise<GetFirstPageIdResponse> {
    const firstPageId = await this.articleService.getFirstPageId(query.articleId);
    return {
      firstPageId,
    };
  }
}
