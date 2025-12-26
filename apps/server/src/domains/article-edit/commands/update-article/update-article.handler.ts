import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateArticleCommand } from './update-article.command';
import { toArticleDto } from '../../presenters';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../contracts';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: UpdateArticleCommand): Promise<SingleArticleDto> {
    const article = await this.service.updateArticle(command.slug, command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
