import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';

import { UpdatePageResponseDto } from '$domains/article-page-edit/dto';
import { ArticlePageEditService } from '$domains/article-page-edit/services';
import { UpdatePageCommand } from './update-page.command';

@CommandHandler(UpdatePageCommand)
export class UpdatePageHandler implements ICommandHandler<UpdatePageCommand> {
  constructor(private readonly articlePageEditService: ArticlePageEditService) {}

  async execute(command: UpdatePageCommand): Promise<UpdatePageResponseDto> {
    const page = await this.articlePageEditService.updatePage(
      command.userId,
      command.articleId,
      command.pageId,
      command.title,
      command.description,
      command.content,
    );

    return {
      id: page.publicId,
      title: page.title,
      description: page.description,
      content: page.content,
      level: page.level,
      order: page.order,
    };
  }
}
