import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { SingleArticleDto } from '../../dto';
import { ArticleEditService } from '../../services/article-edit.service';
import { GetArticleForEditQuery } from './get-article-for-edit.query';

@QueryHandler(GetArticleForEditQuery)
export class GetArticleForEditHandler
  implements IQueryHandler<GetArticleForEditQuery>
{
  constructor(private readonly service: ArticleEditService) {}

  async execute(query: GetArticleForEditQuery): Promise<SingleArticleDto> {
    return this.service.getArticleForEdit(query.slug, query.currentUserId);
  }
}

