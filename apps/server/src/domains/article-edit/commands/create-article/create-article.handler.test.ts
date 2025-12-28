import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { CreateArticleCommand } from './create-article.command';
import { CreateArticleHandler } from './create-article.handler';

describe('CreateArticleHandler', () => {
  let handler: CreateArticleHandler;
  let mockService: any;

  const mockRequest = {
    article: {
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['tag1', 'tag2'],
    },
  };

  beforeEach(async () => {
    mockService = {
      createArticle: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateArticleHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<CreateArticleHandler>(CreateArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle CreateArticleCommand', async () => {
    const currentUserId = 1;
    const command = new CreateArticleCommand(mockRequest, currentUserId);

    const mockArticle = {
      id: 1,
      slug: 'test-article-slug',
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tags: ['tag1', 'tag2'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      userId: currentUserId,
      user: {
        id: currentUserId,
        username: 'testuser',
        bio: null,
        image: null,
      },
      favorites: [],
      _count: {
        favorites: 0,
      },
    };

    mockService.createArticle.mockResolvedValue(mockArticle);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('article');
    expect(result.article).toHaveProperty('slug', 'test-article-slug');
    expect(result.article).toHaveProperty('title', 'Test Article');
    expect(result.article.author).toHaveProperty('username', 'testuser');
    expect(result.article.author).toHaveProperty('following', false);
    expect(mockService.createArticle).toHaveBeenCalledWith(mockRequest, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticle.user.id);
  });
});
