import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ArticleEditService } from '../../services/article-edit.service';
import { DeleteArticleCommand } from './delete-article.command';

@CommandHandler(DeleteArticleCommand)
export class DeleteArticleHandler
  implements ICommandHandler<DeleteArticleCommand>
{
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: DeleteArticleCommand): Promise<void> {
    return this.service.deleteArticle(command.slug, command.currentUserId);
  }
}

