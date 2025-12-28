import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { GetArticleForEditHandler } from './get-article-for-edit.handler';
import { GetArticleForEditQuery } from './get-article-for-edit.query';

describe('GetArticleForEditHandler', () => {
  let handler: GetArticleForEditHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getArticleForEdit: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticleForEditHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetArticleForEditHandler>(GetArticleForEditHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetArticleForEditQuery', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetArticleForEditQuery(slug, currentUserId);

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

    mockService.getArticleForEdit.mockResolvedValue(mockArticle);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(query);

    expect(result).toHaveProperty('article');
    expect(result.article).toHaveProperty('slug', slug);
    expect(result.article).toHaveProperty('title', 'Test Article');
    expect(result.article.author).toHaveProperty('username', 'testuser');
    expect(result.article.author).toHaveProperty('following', false);
    expect(mockService.getArticleForEdit).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticle.user.id);
  });
});
