import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { ArticleRepository } from './article.repository';

describe('ArticleRepository', () => {
  let repository: ArticleRepository;
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

  const mockComment = {
    id: 1,
    body: 'Test comment',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    articleId: 1,
    userId: 1,
    user: {
      id: 1,
      username: 'testuser',
      bio: null,
      image: null,
    },
  };

  beforeEach(async () => {
    mockPrismaAdapter = {
      article: {
        findUnique: vi.fn(),
      },
      comment: {
        findMany: vi.fn(),
      },
      follow: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<ArticleRepository>(ArticleRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getBySlug', () => {
    it('should return article with relations', async () => {
      const slug = 'test-article-slug';

      mockPrismaAdapter.article.findUnique.mockResolvedValue(mockArticle);

      const result = await repository.getBySlug(slug);

      expect(result).toEqual(mockArticle);
      expect(mockPrismaAdapter.article.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: expect.any(Object),
      });
    });

    it('should return null when article is not found', async () => {
      const slug = 'non-existent-slug';

      mockPrismaAdapter.article.findUnique.mockResolvedValue(null);

      const result = await repository.getBySlug(slug);

      expect(result).toBeNull();
      expect(mockPrismaAdapter.article.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: expect.any(Object),
      });
    });
  });

  describe('getComments', () => {
    it('should return comments for an article', async () => {
      const slug = 'test-article-slug';

      mockPrismaAdapter.article.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaAdapter.comment.findMany.mockResolvedValue([mockComment]);

      const result = await repository.getComments(slug);

      expect(result).toEqual([mockComment]);
      expect(mockPrismaAdapter.article.findUnique).toHaveBeenCalledWith({
        where: { slug },
        select: { id: true },
      });
      expect(mockPrismaAdapter.comment.findMany).toHaveBeenCalledWith({
        where: { articleId: 1 },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should return empty array when article is not found', async () => {
      const slug = 'non-existent-slug';

      mockPrismaAdapter.article.findUnique.mockResolvedValue(null);

      const result = await repository.getComments(slug);

      expect(result).toEqual([]);
      expect(mockPrismaAdapter.article.findUnique).toHaveBeenCalledWith({
        where: { slug },
        select: { id: true },
      });
      expect(mockPrismaAdapter.comment.findMany).not.toHaveBeenCalled();
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
