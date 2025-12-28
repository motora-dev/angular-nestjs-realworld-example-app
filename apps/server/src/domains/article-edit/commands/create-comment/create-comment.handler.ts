import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateCommentCommand } from '$domains/article-edit/commands/create-comment/create-comment.command';
import { toCommentDto } from '$domains/article-edit/presenters';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: CreateCommentCommand) {
    const comment = await this.service.createComment(command.slug, command.request, command.currentUserId);
    const isFollowing = await this.service.isFollowing(command.currentUserId, comment.user.id);
    const commentDto = toCommentDto(comment, isFollowing);
    return { comment: commentDto };
  }
}
