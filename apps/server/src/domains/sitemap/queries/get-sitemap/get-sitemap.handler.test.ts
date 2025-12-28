import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { SitemapService } from '$domains/sitemap/services/sitemap.service';
import { GetSitemapHandler } from './get-sitemap.handler';

describe('GetSitemapHandler', () => {
  let handler: GetSitemapHandler;
  let mockService: any;

  const mockSitemapDto = {
    articles: [
      {
        slug: 'test-article-slug',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  };

  beforeEach(async () => {
    mockService = {
      getSitemap: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSitemapHandler,
        {
          provide: SitemapService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetSitemapHandler>(GetSitemapHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetSitemapQuery', async () => {
    mockService.getSitemap.mockResolvedValue(mockSitemapDto);

    const result = await handler.execute();

    expect(result).toEqual(mockSitemapDto);
    expect(mockService.getSitemap).toHaveBeenCalled();
  });
});
