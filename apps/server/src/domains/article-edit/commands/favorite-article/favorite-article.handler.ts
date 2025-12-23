import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FavoriteArticleCommand } from './favorite-article.command';
import { toArticleDto } from '../../presenters';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../contracts';

@CommandHandler(FavoriteArticleCommand)
export class FavoriteArticleHandler implements ICommandHandler<FavoriteArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: FavoriteArticleCommand): Promise<SingleArticleDto> {
    const article = await this.service.favoriteArticle(command.slug, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
