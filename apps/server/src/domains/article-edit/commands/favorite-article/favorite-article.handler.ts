import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FavoriteArticleCommand } from '$domains/article-edit/commands/favorite-article/favorite-article.command';
import { toArticleDto } from '$domains/article-edit/presenters';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(FavoriteArticleCommand)
export class FavoriteArticleHandler implements ICommandHandler<FavoriteArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: FavoriteArticleCommand) {
    const article = await this.service.favoriteArticle(command.slug, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
