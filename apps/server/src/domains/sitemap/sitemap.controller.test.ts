import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { GetSitemapQuery } from './queries';
import { SitemapController } from './sitemap.controller';

import type { SitemapDto } from './contracts';

describe('SitemapController', () => {
  let controller: SitemapController;
  let queryBus: QueryBus;

  const mockSitemapDto: SitemapDto = {
    articles: [
      {
        slug: 'test-article-slug',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitemapController],
      providers: [
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SitemapController>(SitemapController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSitemap', () => {
    it('should return sitemap data', async () => {
      vi.mocked(queryBus.execute).mockResolvedValue(mockSitemapDto);

      const result = await controller.getSitemap();

      expect(result).toEqual(mockSitemapDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetSitemapQuery());
    });
  });
});
