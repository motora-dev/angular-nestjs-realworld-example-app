import { Command } from '@nestjs/cqrs';

import { DeleteArticleCommand } from './delete-article.command';

describe('DeleteArticleCommand', () => {
  it('should create a DeleteArticleCommand with correct properties and extend Command', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new DeleteArticleCommand(slug, currentUserId);

    expect(command).toBeInstanceOf(DeleteArticleCommand);
    expect(command).toBeInstanceOf(Command<void>);
    expect(command.slug).toBe(slug);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const currentUserId = 1;
    const command = new DeleteArticleCommand(slug, currentUserId);

    expect(command.slug).toBe(slug);
  });

  it('should set currentUserId property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 2;
    const command = new DeleteArticleCommand(slug, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
