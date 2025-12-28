import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleListService } from '$domains/article-list/services/article-list.service';
import { GetArticlesHandler } from './get-articles.handler';
import { GetArticlesQuery } from './get-articles.query';

describe('GetArticlesHandler', () => {
  let handler: GetArticlesHandler;
  let mockService: any;

  const mockMultipleArticlesDto = {
    articles: [
      {
        slug: 'test-article-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['tag1', 'tag2'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false,
        },
      },
    ],
    articlesCount: 1,
  };

  beforeEach(async () => {
    mockService = {
      getArticles: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticlesHandler,
        {
          provide: ArticleListService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetArticlesHandler>(GetArticlesHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetArticlesQuery', async () => {
    const params = {
      tag: 'test-tag',
      author: 'test-author',
      offset: 0,
      limit: 20,
    };
    const currentUserId = 1;
    const query = new GetArticlesQuery(params, currentUserId);

    mockService.getArticles.mockResolvedValue(mockMultipleArticlesDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockMultipleArticlesDto);
    expect(mockService.getArticles).toHaveBeenCalledWith(params, currentUserId);
  });

  it('should handle GetArticlesQuery without currentUserId', async () => {
    const params = {
      tag: 'test-tag',
      offset: 0,
      limit: 20,
    };
    const query = new GetArticlesQuery(params);

    mockService.getArticles.mockResolvedValue(mockMultipleArticlesDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockMultipleArticlesDto);
    expect(mockService.getArticles).toHaveBeenCalledWith(params, undefined);
  });
});
