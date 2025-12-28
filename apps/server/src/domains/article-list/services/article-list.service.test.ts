import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { GetArticlesQueryDto } from '$domains/article-list/contracts';
import { ArticleListRepository } from '$domains/article-list/repositories/article-list.repository';
import { ArticleListService } from './article-list.service';
import * as Presenters from '../presenters';

// Mock presenters
vi.mock('../presenters', () => ({
  toArticleDto: vi.fn(),
}));

describe('ArticleListService', () => {
  let service: ArticleListService;
  let mockRepository: any;

  const mockArticleWithRelations = {
    id: 1,
    slug: 'test-article-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tags: ['tag1', 'tag2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    userId: 1,
    user: {
      id: 1,
      username: 'testuser',
      bio: null,
      image: null,
    },
    favorites: [],
    _count: {
      favorites: 0,
    },
  };

  const mockArticleDto = {
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
  };

  beforeEach(async () => {
    mockRepository = {
      getArticles: vi.fn(),
      getFeed: vi.fn(),
      getTags: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleListService,
        {
          provide: ArticleListRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticleListService>(ArticleListService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticles', () => {
    it('should return articles with count', async () => {
      const query: GetArticlesQueryDto = {
        tag: 'test-tag',
        offset: 0,
        limit: 20,
      };
      const currentUserId = 1;

      mockRepository.getArticles.mockResolvedValue({
        articles: [mockArticleWithRelations],
        count: 1,
      });
      mockRepository.isFollowing.mockResolvedValue(false);
      vi.mocked(Presenters.toArticleDto).mockReturnValue(mockArticleDto);

      const result = await service.getArticles(query, currentUserId);

      expect(result).toEqual({
        articles: [mockArticleDto],
        articlesCount: 1,
      });
      expect(mockRepository.getArticles).toHaveBeenCalledWith({
        tag: query.tag,
        author: query.author,
        favorited: query.favorited,
        offset: query.offset,
        limit: query.limit,
        currentUserId,
      });
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticleWithRelations.user.id);
      expect(Presenters.toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, currentUserId, false);
    });

    it('should return articles without currentUserId', async () => {
      const query: GetArticlesQueryDto = {
        tag: 'test-tag',
        offset: 0,
        limit: 20,
      };

      mockRepository.getArticles.mockResolvedValue({
        articles: [mockArticleWithRelations],
        count: 1,
      });
      vi.mocked(Presenters.toArticleDto).mockReturnValue(mockArticleDto);

      const result = await service.getArticles(query);

      expect(result).toEqual({
        articles: [mockArticleDto],
        articlesCount: 1,
      });
      expect(mockRepository.getArticles).toHaveBeenCalledWith({
        tag: query.tag,
        author: query.author,
        favorited: query.favorited,
        offset: query.offset,
        limit: query.limit,
        currentUserId: undefined,
      });
      expect(mockRepository.isFollowing).not.toHaveBeenCalled();
      expect(Presenters.toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, undefined, false);
    });

    it('should handle multiple articles', async () => {
      const query = {
        offset: 0,
        limit: 20,
      };
      const currentUserId = 1;
      const mockArticle2 = {
        ...mockArticleWithRelations,
        id: 2,
        user: {
          ...mockArticleWithRelations.user,
          id: 2,
        },
      };
      const mockArticleDto2 = {
        ...mockArticleDto,
        slug: 'test-article-slug-2',
      };

      mockRepository.getArticles.mockResolvedValue({
        articles: [mockArticleWithRelations, mockArticle2],
        count: 2,
      });
      mockRepository.isFollowing.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      vi.mocked(Presenters.toArticleDto).mockReturnValueOnce(mockArticleDto).mockReturnValueOnce(mockArticleDto2);

      const result = await service.getArticles(query, currentUserId);

      expect(result.articles).toHaveLength(2);
      expect(result.articlesCount).toBe(2);
      expect(mockRepository.isFollowing).toHaveBeenCalledTimes(2);
    });
  });

  describe('getFeed', () => {
    it('should return feed articles with count', async () => {
      const query = {
        offset: 0,
        limit: 20,
      };
      const currentUserId = 1;

      mockRepository.getFeed.mockResolvedValue({
        articles: [mockArticleWithRelations],
        count: 1,
      });
      mockRepository.isFollowing.mockResolvedValue(false);
      vi.mocked(Presenters.toArticleDto).mockReturnValue(mockArticleDto);

      const result = await service.getFeed(query, currentUserId);

      expect(result).toEqual({
        articles: [mockArticleDto],
        articlesCount: 1,
      });
      expect(mockRepository.getFeed).toHaveBeenCalledWith({
        offset: query.offset,
        limit: query.limit,
        currentUserId,
      });
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticleWithRelations.user.id);
      expect(Presenters.toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, currentUserId, false);
    });
  });

  describe('getTags', () => {
    it('should return tags', async () => {
      const tags = ['tag1', 'tag2', 'tag3'];

      mockRepository.getTags.mockResolvedValue(tags);

      const result = await service.getTags();

      expect(result).toEqual({ tags });
      expect(mockRepository.getTags).toHaveBeenCalled();
    });
  });
});
