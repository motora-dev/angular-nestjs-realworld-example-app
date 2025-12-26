import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteArticleCommand } from './delete-article.command';
import { ArticleEditService } from '../../services/article-edit.service';

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler implements ICommandHandler<DeleteArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    return this.service.deleteArticle(command.slug, command.currentUserId);
  }
}
