import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DeleteCommentCommand } from './delete-comment.command';
import { ArticleEditService } from '../../services/article-edit.service';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly service: ArticleEditService) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    return this.service.deleteComment(command.commentId, command.currentUserId);
  }
}
