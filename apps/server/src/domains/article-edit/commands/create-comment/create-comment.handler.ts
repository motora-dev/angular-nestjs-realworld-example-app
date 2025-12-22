import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { SingleCommentDto } from '../../dto';
import { ArticleEditService } from '../../services/article-edit.service';
import { CreateCommentCommand } from './create-comment.command';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateCommentCommand): Promise<SingleCommentDto> {
    return this.service.createComment(
      command.slug,
      command.request,
      command.currentUserId,
    );
  }
}

