import { ERROR_CODE } from '@monorepo/error-code';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ForbiddenError, NotFoundError } from '$errors';
import { ArticleEditService } from './article-edit.service';
import { ArticleEditQueryRepository } from '../repositories/article-edit-query.repository';
import { ArticleEditRepository } from '../repositories/article-edit.repository';

describe('ArticleEditService', () => {
  let service: ArticleEditService;
  let mockRepository: any;
  let mockQueryRepository: any;

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

  const mockCommentWithAuthor = {
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
  } as any;

  beforeEach(async () => {
    mockRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      createComment: vi.fn(),
      deleteComment: vi.fn(),
    };

    mockQueryRepository = {
      getBySlug: vi.fn(),
      getComment: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleEditService,
        {
          provide: ArticleEditRepository,
          useValue: mockRepository,
        },
        {
          provide: ArticleEditQueryRepository,
          useValue: mockQueryRepository,
        },
      ],
    }).compile();

    service = module.get<ArticleEditService>(ArticleEditService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArticle', () => {
    it('should create an article', async () => {
      const request = {
        article: {
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['tag1', 'tag2'],
        },
      };
      const currentUserId = 1;

      mockRepository.create.mockResolvedValue(mockArticleWithRelations);

      const result = await service.createArticle(request, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: request.article.title,
        description: request.article.description,
        body: request.article.body,
        tagList: request.article.tagList,
        userId: currentUserId,
      });
    });

    it('should create an article with empty tagList when tagList is undefined', async () => {
      const request = {
        article: {
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
        },
      };
      const currentUserId = 1;

      mockRepository.create.mockResolvedValue(mockArticleWithRelations);

      const result = await service.createArticle(request as any, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: request.article.title,
        description: request.article.description,
        body: request.article.body,
        tagList: [],
        userId: currentUserId,
      });
    });
  });

  describe('getArticleForEdit', () => {
    it('should return article for editing', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);

      const result = await service.getArticleForEdit(slug, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockQueryRepository.getBySlug).toHaveBeenCalledWith(slug);
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.getArticleForEdit(slug, currentUserId)).rejects.toThrow(NotFoundError);
      await expect(service.getArticleForEdit(slug, currentUserId)).rejects.toThrow(ERROR_CODE.ARTICLE_NOT_FOUND);
    });

    it('should throw ForbiddenError when user is not the owner', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 2;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);

      await expect(service.getArticleForEdit(slug, currentUserId)).rejects.toThrow(ForbiddenError);
      await expect(service.getArticleForEdit(slug, currentUserId)).rejects.toThrow(ERROR_CODE.FORBIDDEN);
    });
  });

  describe('updateArticle', () => {
    it('should update an article', async () => {
      const slug = 'test-article-slug';
      const request = {
        article: {
          title: 'Updated Title',
          description: 'Updated Description',
          body: 'Updated Body',
        },
      };
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.update.mockResolvedValue(mockArticleWithRelations);

      const result = await service.updateArticle(slug, request, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockRepository.update).toHaveBeenCalledWith(slug, {
        title: request.article.title,
        description: request.article.description,
        body: request.article.body,
      });
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const request = { article: { title: 'Updated Title' } };
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.updateArticle(slug, request, currentUserId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not the owner', async () => {
      const slug = 'test-article-slug';
      const request = { article: { title: 'Updated Title' } };
      const currentUserId = 2;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);

      await expect(service.updateArticle(slug, request, currentUserId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteArticle(slug, currentUserId);

      expect(mockRepository.delete).toHaveBeenCalledWith(slug);
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.deleteArticle(slug, currentUserId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not the owner', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 2;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);

      await expect(service.deleteArticle(slug, currentUserId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('favoriteArticle', () => {
    it('should favorite an article', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.addFavorite.mockResolvedValue(undefined);

      const result = await service.favoriteArticle(slug, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockRepository.addFavorite).toHaveBeenCalledWith(mockArticleWithRelations.id, currentUserId);
      expect(mockQueryRepository.getBySlug).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.favoriteArticle(slug, currentUserId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('unfavoriteArticle', () => {
    it('should unfavorite an article', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.removeFavorite.mockResolvedValue(undefined);

      const result = await service.unfavoriteArticle(slug, currentUserId);

      expect(result).toEqual(mockArticleWithRelations);
      expect(mockRepository.removeFavorite).toHaveBeenCalledWith(mockArticleWithRelations.id, currentUserId);
      expect(mockQueryRepository.getBySlug).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.unfavoriteArticle(slug, currentUserId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const slug = 'test-article-slug';
      const request = {
        comment: {
          body: 'Test comment',
        },
      };
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.createComment.mockResolvedValue(mockCommentWithAuthor);

      const result = await service.createComment(slug, request, currentUserId);

      expect(result).toEqual(mockCommentWithAuthor);
      expect(mockRepository.createComment).toHaveBeenCalledWith(
        mockArticleWithRelations.id,
        currentUserId,
        request.comment.body,
      );
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';
      const request = { comment: { body: 'Test comment' } };
      const currentUserId = 1;

      mockQueryRepository.getBySlug.mockResolvedValue(null);

      await expect(service.createComment(slug, request, currentUserId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;
      const currentUserId = 1;

      mockQueryRepository.getComment.mockResolvedValue(mockCommentWithAuthor);
      mockRepository.deleteComment.mockResolvedValue(undefined);

      await service.deleteComment(commentId, currentUserId);

      expect(mockRepository.deleteComment).toHaveBeenCalledWith(commentId, currentUserId);
    });

    it('should throw NotFoundError when comment is not found', async () => {
      const commentId = 999;
      const currentUserId = 1;

      mockQueryRepository.getComment.mockResolvedValue(null);

      await expect(service.deleteComment(commentId, currentUserId)).rejects.toThrow(NotFoundError);
      await expect(service.deleteComment(commentId, currentUserId)).rejects.toThrow(ERROR_CODE.COMMENT_NOT_FOUND);
    });

    it('should throw ForbiddenError when user is not the owner', async () => {
      const commentId = 1;
      const currentUserId = 2;

      mockQueryRepository.getComment.mockResolvedValue(mockCommentWithAuthor);

      await expect(service.deleteComment(commentId, currentUserId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('isFollowing', () => {
    it('should return true when user is following', async () => {
      const followerId = 1;
      const followingId = 2;

      mockQueryRepository.isFollowing.mockResolvedValue(true);

      const result = await service.isFollowing(followerId, followingId);

      expect(result).toBe(true);
      expect(mockQueryRepository.isFollowing).toHaveBeenCalledWith(followerId, followingId);
    });

    it('should return false when user is not following', async () => {
      const followerId = 1;
      const followingId = 2;

      mockQueryRepository.isFollowing.mockResolvedValue(false);

      const result = await service.isFollowing(followerId, followingId);

      expect(result).toBe(false);
      expect(mockQueryRepository.isFollowing).toHaveBeenCalledWith(followerId, followingId);
    });
  });
});
