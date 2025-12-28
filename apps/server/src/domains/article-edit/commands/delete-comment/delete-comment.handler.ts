import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteCommentCommand } from '$domains/article-edit/commands/delete-comment/delete-comment.command';
import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: DeleteCommentCommand) {
    return this.service.deleteComment(command.commentId, command.currentUserId);
  }
}
