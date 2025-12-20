import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CreateArticleCommand } from './create-article.command';
import { CreateArticleResponseDto } from '../../dto';
import { ArticleCreateService } from '../../services';

@QueryHandler(CreateArticleCommand)
export class CreateArticleHandler implements IQueryHandler<CreateArticleCommand> {
  constructor(private readonly articleCreateService: ArticleCreateService) {}

  async execute(command: CreateArticleCommand): Promise<CreateArticleResponseDto> {
    return await this.articleCreateService.createArticle(command.userId);
  }
}
