import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { SingleArticleDto } from '../../dto';
import { ArticleEditService } from '../../services/article-edit.service';
import { FavoriteArticleCommand } from './favorite-article.command';

@CommandHandler(FavoriteArticleCommand)
export class FavoriteArticleHandler
  implements ICommandHandler<FavoriteArticleCommand>
{
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: FavoriteArticleCommand): Promise<SingleArticleDto> {
    return this.service.favoriteArticle(command.slug, command.currentUserId);
  }
}

