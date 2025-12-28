import { Command } from '@nestjs/cqrs';

import type { SingleCommentDto } from '$domains/article-edit/contracts';
import { CreateCommentCommand } from './create-comment.command';

describe('CreateCommentCommand', () => {
  const mockRequest = {
    comment: {
      body: 'Test comment body',
    },
  };

  it('should create a CreateCommentCommand with correct properties and extend Command', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new CreateCommentCommand(slug, mockRequest, currentUserId);

    expect(command).toBeInstanceOf(CreateCommentCommand);
    expect(command).toBeInstanceOf(Command<SingleCommentDto>);
    expect(command.slug).toBe(slug);
    expect(command.request).toEqual(mockRequest);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const currentUserId = 1;
    const command = new CreateCommentCommand(slug, mockRequest, currentUserId);

    expect(command.slug).toBe(slug);
  });

  it('should set request property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new CreateCommentCommand(slug, mockRequest, currentUserId);

    expect(command.request).toEqual(mockRequest);
  });

  it('should set currentUserId property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 2;
    const command = new CreateCommentCommand(slug, mockRequest, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
