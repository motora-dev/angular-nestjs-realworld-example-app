import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { GetArticleHandler } from './get-article.handler';
import { GetArticleQuery } from './get-article.query';
import { ArticleService } from '../../services/article.service';

describe('GetArticleHandler', () => {
  let handler: GetArticleHandler;
  let mockService: any;

  const mockSingleArticleDto = {
    article: {
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
  };

  beforeEach(async () => {
    mockService = {
      getArticle: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticleHandler,
        {
          provide: ArticleService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetArticleHandler>(GetArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetArticleQuery', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetArticleQuery(slug, currentUserId);

    mockService.getArticle.mockResolvedValue(mockSingleArticleDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockSingleArticleDto);
    expect(mockService.getArticle).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.getArticle).toHaveBeenCalledTimes(1);
  });

  it('should handle GetArticleQuery without currentUserId', async () => {
    const slug = 'test-article-slug';
    const query = new GetArticleQuery(slug);

    mockService.getArticle.mockResolvedValue(mockSingleArticleDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockSingleArticleDto);
    expect(mockService.getArticle).toHaveBeenCalledWith(slug, undefined);
    expect(mockService.getArticle).toHaveBeenCalledTimes(1);
  });
});
