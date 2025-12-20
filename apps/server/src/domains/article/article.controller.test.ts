import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ArticleController } from './article.controller';
import { GetArticleQuery } from './queries';

describe('ArticleController', () => {
  let controller: ArticleController;
  let queryBus: QueryBus;

  const mockGetArticleResponse = {
    id: 'article-id-1',
    title: 'Test Article',
    details: 'Test Details',
    spaceId: 'space-id-1',
    type: 'PUBLIC' as const,
    tags: ['test'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    author: {
      id: 1,
      name: 'Test User',
      userName: 'testuser',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article data', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(mockGetArticleResponse);

      const result = await controller.getArticle('article-id-1');

      expect(result).toEqual(mockGetArticleResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleQuery('article-id-1'));
    });
  });

  describe('error handling', () => {
    it('should propagate errors from getArticle', async () => {
      vi.mocked(queryBus.execute).mockRejectedValue(new Error('Article not found'));

      await expect(controller.getArticle('nonexistent')).rejects.toThrow('Article not found');
    });

    it('should handle null response from getArticle', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(null);

      const result = await controller.getArticle('article-id-1');

      expect(result).toBeNull();
    });
  });
});
