import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { ArticleEditQueryRepository } from './article-edit-query.repository';

describe('ArticleEditQueryRepository', () => {
  let repository: ArticleEditQueryRepository;
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
    publicId: 'test-public-id',
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
        findUnique: vi.fn(),
      },
      follow: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleEditQueryRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<ArticleEditQueryRepository>(ArticleEditQueryRepository);
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

  describe('getComment', () => {
    it('should return comment with author', async () => {
      const commentId = 1;

      mockPrismaAdapter.comment.findUnique.mockResolvedValue(mockComment);

      const result = await repository.getComment(commentId);

      expect(result).toEqual(mockComment);
      expect(mockPrismaAdapter.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: expect.any(Object),
      });
    });

    it('should return null when comment is not found', async () => {
      const commentId = 999;

      mockPrismaAdapter.comment.findUnique.mockResolvedValue(null);

      const result = await repository.getComment(commentId);

      expect(result).toBeNull();
      expect(mockPrismaAdapter.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId },
        include: expect.any(Object),
      });
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
