import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateCommentCommand } from './create-comment.command';
import { toCommentDto } from '../../presenters';
import { ArticleEditService } from '../../services/article-edit.service';

import type { SingleCommentDto } from '../../contracts';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateCommentCommand): Promise<SingleCommentDto> {
    const comment = await this.service.createComment(command.slug, command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, comment.user.id);
    const commentDto = toCommentDto(comment, isFollowing);
    return { comment: commentDto };
  }
}
