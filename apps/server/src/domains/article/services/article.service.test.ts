import { ERROR_CODE } from '@monorepo/error-code';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { NotFoundError } from '$errors';
import { ArticleService } from './article.service';
import { toArticleDto, toCommentDto } from '../presenters';
import { ArticleRepository } from '../repositories';

// Mock presenters
vi.mock('../presenters', () => ({
  toArticleDto: vi.fn(),
  toCommentDto: vi.fn(),
}));

describe('ArticleService', () => {
  let service: ArticleService;
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
    user: {
      id: 1,
      username: 'testuser',
      bio: null,
      image: null,
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

  const mockCommentDto = {
    id: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    body: 'Test comment',
    author: {
      username: 'testuser',
      bio: null,
      image: null,
      following: false,
    },
  };

  beforeEach(async () => {
    mockRepository = {
      getBySlug: vi.fn(),
      getComments: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article data', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.isFollowing.mockResolvedValue(false);
      vi.mocked(toArticleDto).mockReturnValue(mockArticleDto);

      const result = await service.getArticle(slug, currentUserId);

      expect(result).toEqual({ article: mockArticleDto });
      expect(mockRepository.getBySlug).toHaveBeenCalledWith(slug);
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticleWithRelations.user.id);
      expect(toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, currentUserId, false);
    });

    it('should return article data without currentUserId', async () => {
      const slug = 'test-article-slug';

      mockRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      vi.mocked(toArticleDto).mockReturnValue(mockArticleDto);

      const result = await service.getArticle(slug);

      expect(result).toEqual({ article: mockArticleDto });
      expect(mockRepository.getBySlug).toHaveBeenCalledWith(slug);
      expect(mockRepository.isFollowing).not.toHaveBeenCalled();
      expect(toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, undefined, false);
    });

    it('should throw NotFoundError when article is not found', async () => {
      const slug = 'non-existent-slug';

      mockRepository.getBySlug.mockResolvedValue(null);

      await expect(service.getArticle(slug)).rejects.toThrow(NotFoundError);
      await expect(service.getArticle(slug)).rejects.toThrow(ERROR_CODE.ARTICLE_NOT_FOUND);
      expect(mockRepository.getBySlug).toHaveBeenCalledWith(slug);
    });

    it('should check isFollowing when currentUserId is provided', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockRepository.getBySlug.mockResolvedValue(mockArticleWithRelations);
      mockRepository.isFollowing.mockResolvedValue(true);
      vi.mocked(toArticleDto).mockReturnValue(mockArticleDto);

      await service.getArticle(slug, currentUserId);

      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockArticleWithRelations.user.id);
      expect(toArticleDto).toHaveBeenCalledWith(mockArticleWithRelations, currentUserId, true);
    });
  });

  describe('getComments', () => {
    it('should return comments data', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;

      mockRepository.getComments.mockResolvedValue([mockCommentWithAuthor]);
      mockRepository.isFollowing.mockResolvedValue(false);
      vi.mocked(toCommentDto).mockReturnValue(mockCommentDto);

      const result = await service.getComments(slug, currentUserId);

      expect(result).toEqual({ comments: [mockCommentDto] });
      expect(mockRepository.getComments).toHaveBeenCalledWith(slug);
      expect(mockRepository.isFollowing).toHaveBeenCalledWith(currentUserId, mockCommentWithAuthor.user.id);
      expect(toCommentDto).toHaveBeenCalledWith(mockCommentWithAuthor, false);
    });

    it('should return comments data without currentUserId', async () => {
      const slug = 'test-article-slug';

      mockRepository.getComments.mockResolvedValue([mockCommentWithAuthor]);
      vi.mocked(toCommentDto).mockReturnValue(mockCommentDto);

      const result = await service.getComments(slug);

      expect(result).toEqual({ comments: [mockCommentDto] });
      expect(mockRepository.getComments).toHaveBeenCalledWith(slug);
      expect(mockRepository.isFollowing).not.toHaveBeenCalled();
      expect(toCommentDto).toHaveBeenCalledWith(mockCommentWithAuthor, false);
    });

    it('should handle multiple comments', async () => {
      const slug = 'test-article-slug';
      const currentUserId = 1;
      const mockComment2 = {
        ...mockCommentWithAuthor,
        id: 2,
        user: {
          ...mockCommentWithAuthor.user,
          id: 2,
        },
      };
      const mockCommentDto2 = {
        ...mockCommentDto,
        id: 2,
      };

      mockRepository.getComments.mockResolvedValue([mockCommentWithAuthor, mockComment2]);
      mockRepository.isFollowing.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      vi.mocked(toCommentDto).mockReturnValueOnce(mockCommentDto).mockReturnValueOnce(mockCommentDto2);

      const result = await service.getComments(slug, currentUserId);

      expect(result.comments).toHaveLength(2);
      expect(mockRepository.isFollowing).toHaveBeenCalledTimes(2);
    });
  });
});
