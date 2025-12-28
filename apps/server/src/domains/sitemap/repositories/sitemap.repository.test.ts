import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { PrismaAdapter } from '$adapters';
import { SitemapRepository } from './sitemap.repository';

describe('SitemapRepository', () => {
  let repository: SitemapRepository;
  let mockPrismaAdapter: any;

  const mockArticles = [
    {
      slug: 'test-article-slug',
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    },
    {
      slug: 'test-article-slug-2',
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    },
  ];

  beforeEach(async () => {
    mockPrismaAdapter = {
      article: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitemapRepository,
        {
          provide: PrismaAdapter,
          useValue: mockPrismaAdapter,
        },
      ],
    }).compile();

    repository = module.get<SitemapRepository>(SitemapRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getSitemapData', () => {
    it('should return articles with slug and updatedAt', async () => {
      mockPrismaAdapter.article.findMany.mockResolvedValue(mockArticles);

      const result = await repository.getSitemapData();

      expect(result).toEqual(mockArticles);
      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return empty array when no articles', async () => {
      mockPrismaAdapter.article.findMany.mockResolvedValue([]);

      const result = await repository.getSitemapData();

      expect(result).toEqual([]);
      expect(mockPrismaAdapter.article.findMany).toHaveBeenCalledWith({
        select: {
          slug: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
