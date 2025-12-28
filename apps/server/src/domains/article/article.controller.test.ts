import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleController } from './article.controller';
import { GetArticleQuery, GetCommentsQuery } from './queries';

describe('ArticleController', () => {
  let controller: ArticleController;
  let queryBus: QueryBus;

  const mockSingleArticleDto = {
    article: {
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
    },
  };

  const mockMultipleCommentsDto = {
    comments: [
      {
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
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticle', () => {
    it('should return article data', async () => {
      const slug = 'test-article-slug';
      vi.mocked(queryBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.getArticle(slug);

      expect(result).toEqual(mockSingleArticleDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleQuery(slug, undefined));
    });

    it('should return article data with current user', async () => {
      const slug = 'test-article-slug';
      const currentUser = { id: 1 } as any;
      vi.mocked(queryBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.getArticle(slug, currentUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleQuery(slug, currentUser.id));
    });
  });

  describe('getComments', () => {
    it('should return comments data', async () => {
      const slug = 'test-article-slug';
      vi.mocked(queryBus.execute).mockResolvedValue(mockMultipleCommentsDto);

      const result = await controller.getComments(slug);

      expect(result).toEqual(mockMultipleCommentsDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetCommentsQuery(slug, undefined));
    });

    it('should return comments data with current user', async () => {
      const slug = 'test-article-slug';
      const currentUser = { id: 1 } as any;
      vi.mocked(queryBus.execute).mockResolvedValue(mockMultipleCommentsDto);

      const result = await controller.getComments(slug, currentUser);

      expect(result).toEqual(mockMultipleCommentsDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetCommentsQuery(slug, currentUser.id));
    });
  });
});
