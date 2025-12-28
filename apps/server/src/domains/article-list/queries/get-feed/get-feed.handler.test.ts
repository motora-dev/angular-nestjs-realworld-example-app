import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleListService } from '$domains/article-list/services/article-list.service';
import { GetFeedHandler } from './get-feed.handler';
import { GetFeedQuery } from './get-feed.query';

describe('GetFeedHandler', () => {
  let handler: GetFeedHandler;
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
      getFeed: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFeedHandler,
        {
          provide: ArticleListService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetFeedHandler>(GetFeedHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetFeedQuery', async () => {
    const params = {
      offset: 0,
      limit: 20,
    };
    const currentUserId = 1;
    const query = new GetFeedQuery(params, currentUserId);

    mockService.getFeed.mockResolvedValue(mockMultipleArticlesDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockMultipleArticlesDto);
    expect(mockService.getFeed).toHaveBeenCalledWith(params, currentUserId);
  });
});
