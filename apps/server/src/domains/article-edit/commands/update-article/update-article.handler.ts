import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';

import { UpdateArticleResponseDto } from '$domains/article-edit/dto';
import { ArticleEditService } from '$domains/article-edit/services';
import { UpdateArticleCommand } from './update-article.command';

@CommandHandler(UpdateArticleCommand)
export class UpdateArticleHandler implements ICommandHandler<UpdateArticleCommand> {
  constructor(private readonly articleEditService: ArticleEditService) {}

  async execute(command: UpdateArticleCommand): Promise<UpdateArticleResponseDto> {
    const article = await this.articleEditService.updateArticle(
      command.userId,
      command.articleId,
      command.title,
      command.tags,
      command.content,
    );

    return {
      id: article.publicId,
      title: article.title,
      tags: article.tags,
      description: article.description ?? '',
    };
  }
}
