import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateArticleCommand } from './create-article.command';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleArticleDto } from '../../dto';

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateArticleCommand): Promise<SingleArticleDto> {
    return this.service.createArticle(command.request, command.currentUserId);
  }
}
