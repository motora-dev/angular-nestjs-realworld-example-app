import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UnfavoriteArticleCommand } from '$domains/article-edit/commands/unfavorite-article/unfavorite-article.command';
import { toArticleDto } from '$domains/article-edit/presenters';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(UnfavoriteArticleCommand)
export class UnfavoriteArticleHandler implements ICommandHandler<UnfavoriteArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: UnfavoriteArticleCommand) {
    const article = await this.service.unfavoriteArticle(command.slug, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
