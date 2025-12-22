import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateArticleCommand } from './update-article.command';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../dto';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: UpdateArticleCommand): Promise<SingleArticleDto> {
    return this.service.updateArticle(command.slug, command.request, command.currentUserId);
  }
}
