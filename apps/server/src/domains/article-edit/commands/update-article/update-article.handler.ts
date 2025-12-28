import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateArticleCommand } from '$domains/article-edit/commands/update-article/update-article.command';
import { toArticleDto } from '$domains/article-edit/presenters';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: UpdateArticleCommand) {
    const article = await this.service.updateArticle(command.slug, command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, article.user.id);
    const articleDto = toArticleDto(article, command.currentUserId, isFollowing);
    return { article: articleDto };
  }
}
