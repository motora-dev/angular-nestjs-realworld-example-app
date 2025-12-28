import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { UpdateArticleCommand } from './update-article.command';
import { UpdateArticleHandler } from './update-article.handler';

describe('UpdateArticleHandler', () => {
  let handler: UpdateArticleHandler;
  let mockService: any;

  const mockRequest = {
    article: {
      title: 'Updated Title',
      description: 'Updated Description',
      body: 'Updated Body',
    },
  };

  beforeEach(async () => {
    mockService = {
      updateArticle: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateArticleHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<UpdateArticleHandler>(UpdateArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle UpdateArticleCommand', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new UpdateArticleCommand(slug, mockRequest, currentUserId);

    const mockArticle = {
      id: 1,
      slug,
      title: 'Updated Title',
      description: 'Updated Description',
      body: 'Updated Body',
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

    mockService.updateArticle.mockResolvedValue(mockArticle);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('article');
    expect(result.article).toHaveProperty('slug', slug);
    expect(result.article).toHaveProperty('title', 'Updated Title');
    expect(result.article.author).toHaveProperty('username', 'testuser');
    expect(result.article.author).toHaveProperty('following', false);
    expect(mockService.updateArticle).toHaveBeenCalledWith(slug, mockRequest, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticle.user.id);
  });
});
