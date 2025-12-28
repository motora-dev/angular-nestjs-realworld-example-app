import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { ArticleEditRepository } from './article-edit.repository';

describe('ArticleEditRepository', () => {
  let repository: ArticleEditRepository;
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
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      favorite: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      comment: {
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleEditRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<ArticleEditRepository>(ArticleEditRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an article', async () => {
      const params = {
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['tag1', 'tag2'],
        userId: 1,
      };

      mockPrismaAdapter.article.create.mockResolvedValue(mockArticle);

      const result = await repository.create(params);

      expect(result).toEqual(mockArticle);
      expect(mockPrismaAdapter.article.create).toHaveBeenCalledWith({
        data: {
          slug: expect.any(String),
          title: params.title,
          description: params.description,
          body: params.body,
          tags: params.tagList,
          userId: params.userId,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const slug = 'test-article-slug';
      const params = {
        title: 'Updated Title',
        description: 'Updated Description',
        body: 'Updated Body',
      };

      mockPrismaAdapter.article.update.mockResolvedValue(mockArticle);

      const result = await repository.update(slug, params);

      expect(result).toEqual(mockArticle);
      expect(mockPrismaAdapter.article.update).toHaveBeenCalledWith({
        where: { slug },
        data: {
          title: params.title,
          description: params.description,
          body: params.body,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const slug = 'test-article-slug';

      mockPrismaAdapter.article.delete.mockResolvedValue(undefined);

      await repository.delete(slug);

      expect(mockPrismaAdapter.article.delete).toHaveBeenCalledWith({
        where: { slug },
      });
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite', async () => {
      const articleId = 1;
      const userId = 1;

      mockPrismaAdapter.favorite.upsert.mockResolvedValue(undefined);

      await repository.addFavorite(articleId, userId);

      expect(mockPrismaAdapter.favorite.upsert).toHaveBeenCalledWith({
        where: {
          userId_articleId: { userId, articleId },
        },
        create: { userId, articleId },
        update: {},
      });
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', async () => {
      const articleId = 1;
      const userId = 1;

      mockPrismaAdapter.favorite.deleteMany.mockResolvedValue(undefined);

      await repository.removeFavorite(articleId, userId);

      expect(mockPrismaAdapter.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId, articleId },
      });
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const articleId = 1;
      const userId = 1;
      const body = 'Test comment';

      mockPrismaAdapter.comment.create.mockResolvedValue(mockComment);

      const result = await repository.createComment(articleId, userId, body);

      expect(result).toEqual(mockComment);
      expect(mockPrismaAdapter.comment.create).toHaveBeenCalledWith({
        data: {
          publicId: expect.any(String),
          body,
          articleId,
          userId,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;
      const userId = 1;

      mockPrismaAdapter.comment.deleteMany.mockResolvedValue(undefined);

      await repository.deleteComment(commentId, userId);

      expect(mockPrismaAdapter.comment.deleteMany).toHaveBeenCalledWith({
        where: { id: commentId, userId },
      });
    });
  });
});
