import { Command } from '@nestjs/cqrs';

import { DeleteCommentCommand } from './delete-comment.command';

describe('DeleteCommentCommand', () => {
  it('should create a DeleteCommentCommand with correct properties and extend Command', () => {
    const commentId = 1;
    const currentUserId = 1;
    const command = new DeleteCommentCommand(commentId, currentUserId);

    expect(command).toBeInstanceOf(DeleteCommentCommand);
    expect(command).toBeInstanceOf(Command<void>);
    expect(command.commentId).toBe(commentId);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set commentId property correctly', () => {
    const commentId = 2;
    const currentUserId = 1;
    const command = new DeleteCommentCommand(commentId, currentUserId);

    expect(command.commentId).toBe(commentId);
  });

  it('should set currentUserId property correctly', () => {
    const commentId = 1;
    const currentUserId = 2;
    const command = new DeleteCommentCommand(commentId, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
