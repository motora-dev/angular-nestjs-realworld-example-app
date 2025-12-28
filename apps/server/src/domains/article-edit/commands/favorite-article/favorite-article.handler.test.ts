import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { FavoriteArticleCommand } from './favorite-article.command';
import { FavoriteArticleHandler } from './favorite-article.handler';

describe('FavoriteArticleHandler', () => {
  let handler: FavoriteArticleHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      favoriteArticle: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteArticleHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<FavoriteArticleHandler>(FavoriteArticleHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle FavoriteArticleCommand', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new FavoriteArticleCommand(slug, currentUserId);

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
      favorites: [{ userId: currentUserId }],
      _count: {
        favorites: 1,
      },
    };

    mockService.favoriteArticle.mockResolvedValue(mockArticle);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('article');
    expect(result.article).toHaveProperty('slug', slug);
    expect(result.article).toHaveProperty('favorited', true);
    expect(result.article).toHaveProperty('favoritesCount', 1);
    expect(result.article.author).toHaveProperty('username', 'testuser');
    expect(mockService.favoriteArticle).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticle.user.id);
  });
});
