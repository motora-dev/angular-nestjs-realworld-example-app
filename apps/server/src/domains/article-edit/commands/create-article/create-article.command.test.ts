import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';
import { CreateArticleCommand } from './create-article.command';

describe('CreateArticleCommand', () => {
  const mockRequest = {
    article: {
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['tag1', 'tag2'],
    },
  };

  it('should create a CreateArticleCommand with correct properties and extend Command', () => {
    const currentUserId = 1;
    const command = new CreateArticleCommand(mockRequest, currentUserId);

    expect(command).toBeInstanceOf(CreateArticleCommand);
    expect(command).toBeInstanceOf(Command<SingleArticleDto>);
    expect(command.request).toEqual(mockRequest);
    expect(command.currentUserId).toBe(currentUserId);
  });

  it('should set request property correctly', () => {
    const currentUserId = 1;
    const command = new CreateArticleCommand(mockRequest, currentUserId);

    expect(command.request).toEqual(mockRequest);
  });

  it('should set currentUserId property correctly', () => {
    const currentUserId = 2;
    const command = new CreateArticleCommand(mockRequest, currentUserId);

    expect(command.currentUserId).toBe(currentUserId);
  });
});
