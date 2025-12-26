import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetArticleForEditQuery } from './get-article-for-edit.query';
import { toArticleDto } from '../../presenters';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../contracts';

@QueryHandler(GetArticleForEditQuery)
export class GetArticleForEditHandler implements IQueryHandler<GetArticleForEditQuery> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(query: GetArticleForEditQuery): Promise<SingleArticleDto> {
    const article = await this.service.getArticleForEdit(query.slug, query.currentUserId);
    const isFollowing = await this.service.isFollowing(query.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, query.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
