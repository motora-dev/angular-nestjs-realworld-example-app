import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { ArticleListRepository } from './article-list.repository';

describe('ArticleListRepository', () => {
  let repository: ArticleListRepository;
  let mockPrismaAdapter: any;

  const mockArticle = {
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

  beforeEach(async () => {
    mockPrismaAdapter = {
      article: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      follow: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleListRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<ArticleListRepository>(ArticleListRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getArticles', () => {
    it('should return articles with count', async () => {
      const params = {
        offset: 0,
        limit: 20,
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      const result = await repository.getArticles(params);

      expect(result).toEqual({
        articles: [mockArticle],
        count: 1,
      });
      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
        include: expect.any(Object),
      });
      expect(mockPrismaAdapter.article.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by tag', async () => {
      const params = {
        tag: 'test-tag',
        offset: 0,
        limit: 20,
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      await repository.getArticles(params);

      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        where: {
          tags: { has: 'test-tag' },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
        include: expect.any(Object),
      });
    });

    it('should filter by author', async () => {
      const params = {
        author: 'test-author',
        offset: 0,
        limit: 20,
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      await repository.getArticles(params);

      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        where: {
          user: { username: 'test-author' },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
        include: expect.any(Object),
      });
    });

    it('should filter by favorited', async () => {
      const params = {
        favorited: 'test-user',
        offset: 0,
        limit: 20,
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      await repository.getArticles(params);

      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        where: {
          favorites: {
            some: {
              user: { username: 'test-user' },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
        include: expect.any(Object),
      });
    });

    it('should use default offset and limit', async () => {
      const params = {
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      await repository.getArticles(params);

      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('getFeed', () => {
    it('should return feed articles with count', async () => {
      const params = {
        offset: 0,
        limit: 20,
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      const result = await repository.getFeed(params);

      expect(result).toEqual({
        articles: [mockArticle],
        count: 1,
      });
      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            followers: {
              some: { followerId: params.currentUserId },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.offset,
        take: params.limit,
        include: expect.any(Object),
      });
      expect(mockPrismaAdapter.article.count).toHaveBeenCalledWith({
        where: {
          user: {
            followers: {
              some: { followerId: params.currentUserId },
            },
          },
        },
      });
    });

    it('should use default offset and limit', async () => {
      const params = {
        currentUserId: 1,
      };

      mockPrismaAdapter.article.findMany.mockResolvedValue([mockArticle]);
      mockPrismaAdapter.article.count.mockResolvedValue(1);

      await repository.getFeed(params);

      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('getTags', () => {
    it('should return sorted unique tags', async () => {
      const articles = [{ tags: ['tag1', 'tag2'] }, { tags: ['tag2', 'tag3'] }, { tags: ['tag1'] }];

      mockPrismaAdapter.article.findMany.mockResolvedValue(articles);

      const result = await repository.getTags();

      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        select: { tags: true },
      });
    });

    it('should return empty array when no articles', async () => {
      mockPrismaAdapter.article.findMany.mockResolvedValue([]);

      const result = await repository.getTags();

      expect(result).toEqual([]);
    });
  });

  describe('isFollowing', () => {
    it('should return true when follow relationship exists', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.findUnique.mockResolvedValue({
        followerId,
        followingId,
      });

      const result = await repository.isFollowing(followerId, followingId);

      expect(result).toBe(true);
      expect(mockPrismaAdapter.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
    });

    it('should return false when follow relationship does not exist', async () => {
      const followerId = 1;
      const followingId = 2;

      mockPrismaAdapter.follow.findUnique.mockResolvedValue(null);

      const result = await repository.isFollowing(followerId, followingId);

      expect(result).toBe(false);
      expect(mockPrismaAdapter.follow.findUnique).toHaveBeenCalledWith({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });
    });
  });
});
