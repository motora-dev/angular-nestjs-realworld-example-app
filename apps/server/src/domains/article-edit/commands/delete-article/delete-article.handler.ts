import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteArticleCommand } from '$domains/article-edit/commands/delete-article/delete-article.command';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler implements ICommandHandler<DeleteArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: DeleteArticleCommand) {
    return this.service.deleteArticle(command.slug, command.currentUserId);
  }
}
