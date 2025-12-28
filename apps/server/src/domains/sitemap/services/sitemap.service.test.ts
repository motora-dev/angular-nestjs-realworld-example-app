import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { SitemapRepository } from '$domains/sitemap/repositories/sitemap.repository';
import { SitemapService } from './sitemap.service';

describe('SitemapService', () => {
  let service: SitemapService;
  let mockRepository: any;

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
    mockRepository = {
      getSitemapData: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitemapService,
        {
          provide: SitemapRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SitemapService>(SitemapService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSitemap', () => {
    it('should return sitemap data with articles', async () => {
      mockRepository.getSitemapData.mockResolvedValue(mockArticles);

      const result = await service.getSitemap();

      expect(result).toEqual({
        articles: [
          {
            slug: 'test-article-slug',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            slug: 'test-article-slug-2',
            updatedAt: '2024-01-02T00:00:00.000Z',
          },
        ],
      });
      expect(mockRepository.getSitemapData).toHaveBeenCalled();
    });

    it('should return empty articles array when no articles', async () => {
      mockRepository.getSitemapData.mockResolvedValue([]);

      const result = await service.getSitemap();

      expect(result).toEqual({
        articles: [],
      });
      expect(mockRepository.getSitemapData).toHaveBeenCalled();
    });
  });
});
