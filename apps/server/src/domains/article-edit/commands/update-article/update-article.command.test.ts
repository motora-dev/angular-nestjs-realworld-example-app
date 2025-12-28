import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';
import { UpdateArticleCommand } from './update-article.command';

describe('UpdateArticleCommand', () => {
  const mockRequest = {
    article: {
      title: 'Updated Title',
      description: 'Updated Description',
      body: 'Updated Body',
    },
  };

  it('should create an UpdateArticleCommand with correct properties and extend Command', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new UpdateArticleCommand(slug, mockRequest, currentUserId);

    expect(command).toBeInstanceOf(UpdateArticleCommand);
    expect(command).toBeInstanceOf(Command<SingleArticleDto>);
    expect(command.slug).toBe(slug);
    expect(command.request).toEqual(mockRequest);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const currentUserId = 1;
    const command = new UpdateArticleCommand(slug, mockRequest, currentUserId);

    expect(command.slug).toBe(slug);
  });

  it('should set request property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new UpdateArticleCommand(slug, mockRequest, currentUserId);

    expect(command.request).toEqual(mockRequest);
  });

  it('should set currentUserId property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 2;
    const command = new UpdateArticleCommand(slug, mockRequest, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
