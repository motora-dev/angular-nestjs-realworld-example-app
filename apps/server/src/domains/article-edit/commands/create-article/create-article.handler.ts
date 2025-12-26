import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateArticleCommand } from './create-article.command';
import { toArticleDto } from '../../presenters';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../contracts';

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateArticleCommand): Promise<SingleArticleDto> {
    const article = await this.service.createArticle(command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
