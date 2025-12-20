import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { ArticleListController } from './article-list.controller';
import { GetArticleListQuery } from './queries';

describe('ArticleListController', () => {
  let controller: ArticleListController;
  let queryBus: QueryBus;

  const mockGetArticleListResponse = {
    articleList: [
      {
        id: 'public-id-1',
        title: 'Article 1',
        tags: ['tag1', 'tag2'],
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'public-id-2',
        title: 'Article 2',
        tags: ['tag3'],
        createdAt: new Date('2024-01-02'),
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleListController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn().mockResolvedValue(mockGetArticleListResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticleListController>(ArticleListController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArticleList', () => {
    it('should return article list', async () => {
      const result = await controller.getArticleList();

      expect(result).toEqual(mockGetArticleListResponse);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleListQuery());
    });
  });
});
