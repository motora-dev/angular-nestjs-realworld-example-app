import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { DeleteArticleCommand } from './delete-article.command';
import { DeleteArticleHandler } from './delete-article.handler';

describe('DeleteArticleHandler', () => {
  let handler: DeleteArticleHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      deleteArticle: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteArticleHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<DeleteArticleHandler>(DeleteArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle DeleteArticleCommand', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new DeleteArticleCommand(slug, currentUserId);

    mockService.deleteArticle.mockResolvedValue(undefined);

    const result = await handler.execute(command);

    expect(result).toBeUndefined();
    expect(mockService.deleteArticle).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.deleteArticle).toHaveBeenCalledTimes(1);
  });
});
