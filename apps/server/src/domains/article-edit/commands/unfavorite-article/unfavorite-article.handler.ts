import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { SingleArticleDto } from '../../dto';
import { ArticleEditService } from '../../services/article-edit.service';
import { UnfavoriteArticleCommand } from './unfavorite-article.command';

@CommandHandler(UnfavoriteArticleCommand)
export class UnfavoriteArticleHandler
  implements ICommandHandler<UnfavoriteArticleCommand>
{
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: UnfavoriteArticleCommand): Promise<SingleArticleDto> {
    return this.service.unfavoriteArticle(command.slug, command.currentUserId);
  }
}

