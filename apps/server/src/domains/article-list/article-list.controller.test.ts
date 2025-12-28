import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { CurrentUserType } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { ArticleListController } from './article-list.controller';
import { GetArticlesQueryDto, GetFeedQueryDto, MultipleArticlesDto, TagsDto } from './contracts';
import { GetArticlesQuery, GetFeedQuery, GetTagsQuery } from './queries';

describe('ArticleListController', () => {
  let controller: ArticleListController;
  let queryBus: QueryBus;

  const mockMultipleArticlesDto: MultipleArticlesDto = {
    articles: [
      {
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
    ],
    articlesCount: 1,
  };

  const mockTagsDto: TagsDto = {
    tags: ['tag1', 'tag2', 'tag3'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleListController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<ArticleListController>(ArticleListController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticles', () => {
    it('should return articles data', async () => {
      const query: GetArticlesQueryDto = {
        tag: 'test-tag',
        offset: 0,
        limit: 20,
      };
      vi.mocked(queryBus.execute).mockResolvedValue(mockMultipleArticlesDto);

      const result = await controller.getArticles(query);

      expect(result).toEqual(mockMultipleArticlesDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticlesQuery(query, undefined));
    });

    it('should return articles data with current user', async () => {
      const query: GetArticlesQueryDto = {
        tag: 'test-tag',
        offset: 0,
        limit: 20,
      };
      const user: CurrentUserType = { id: 1, publicId: 'test-public-id', username: 'testuser' };
      vi.mocked(queryBus.execute).mockResolvedValue(mockMultipleArticlesDto);

      const result = await controller.getArticles(query, user);

      expect(result).toEqual(mockMultipleArticlesDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticlesQuery(query, user.id));
    });
  });

  describe('getFeed', () => {
    it('should return feed articles', async () => {
      const query: GetFeedQueryDto = {
        offset: 0,
        limit: 20,
      };
      const user: CurrentUserType = { id: 1, publicId: 'test-public-id', username: 'testuser' };
      vi.mocked(queryBus.execute).mockResolvedValue(mockMultipleArticlesDto);

      const result = await controller.getFeed(query, user);

      expect(result).toEqual(mockMultipleArticlesDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetFeedQuery(query, user.id));
    });
  });

  describe('getTags', () => {
    it('should return tags', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(mockTagsDto);

      const result = await controller.getTags();

      expect(result).toEqual(mockTagsDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetTagsQuery());
    });
  });
});
