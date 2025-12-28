import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';
import { FavoriteArticleCommand } from './favorite-article.command';

describe('FavoriteArticleCommand', () => {
  it('should create a FavoriteArticleCommand with correct properties and extend Command', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new FavoriteArticleCommand(slug, currentUserId);

    expect(command).toBeInstanceOf(FavoriteArticleCommand);
    expect(command).toBeInstanceOf(Command<SingleArticleDto>);
    expect(command.slug).toBe(slug);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const currentUserId = 1;
    const command = new FavoriteArticleCommand(slug, currentUserId);

    expect(command.slug).toBe(slug);
  });

  it('should set currentUserId property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 2;
    const command = new FavoriteArticleCommand(slug, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
