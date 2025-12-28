import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { UnfavoriteArticleCommand } from './unfavorite-article.command';
import { UnfavoriteArticleHandler } from './unfavorite-article.handler';

describe('UnfavoriteArticleHandler', () => {
  let handler: UnfavoriteArticleHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      unfavoriteArticle: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnfavoriteArticleHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<UnfavoriteArticleHandler>(UnfavoriteArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle UnfavoriteArticleCommand', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new UnfavoriteArticleCommand(slug, currentUserId);

    const mockArticle = {
      id: 1,
      slug,
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

    mockService.unfavoriteArticle.mockResolvedValue(mockArticle);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('article');
    expect(result.article).toHaveProperty('slug', slug);
    expect(result.article).toHaveProperty('favorited', false);
    expect(result.article).toHaveProperty('favoritesCount', 0);
    expect(result.article.author).toHaveProperty('username', 'testuser');
    expect(mockService.unfavoriteArticle).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticle.user.id);
  });
});
