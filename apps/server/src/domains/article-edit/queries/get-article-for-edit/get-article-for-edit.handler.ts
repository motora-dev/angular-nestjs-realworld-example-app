import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { toArticleDto } from '$domains/article-edit/presenters';
import { GetArticleForEditQuery } from '$domains/article-edit/queries/get-article-for-edit/get-article-for-edit.query';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@QueryHandler(GetArticleForEditQuery)
export class GetArticleForEditHandler implements IQueryHandler<GetArticleForEditQuery> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(query: GetArticleForEditQuery) {
    const article = await this.service.getArticleForEdit(query.slug, query.currentUserId);
    const isFollowing = await this.service.isFollowing(query.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, query.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
