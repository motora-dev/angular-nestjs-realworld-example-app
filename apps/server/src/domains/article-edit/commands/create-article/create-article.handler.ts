import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { toArticleDto } from '$domains/article-edit/presenters';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { CreateArticleCommand } from './create-article.command';

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateArticleCommand) {
    // 戻り値型を明示しないことで、Command<SingleArticleDto> の型が変われば自動で追従
    const article = await this.service.createArticle(command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
