import { Command } from '@nestjs/cqrs';

export class DeleteCommentCommand extends Command<void> {
  constructor(
    public readonly commentId: number,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
