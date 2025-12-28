import { Injectable } from '@nestjs/common';

import type { SitemapDto } from '$domains/sitemap/contracts';
import { SitemapRepository } from '$domains/sitemap/repositories/sitemap.repository';

@Injectable()
export class SitemapService {
  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async getSitemap(): Promise<SitemapDto> {
    const articles = await this.sitemapRepository.getSitemapData();

    return {
      articles: articles.map((article) => ({
        slug: article.slug,
        updatedAt: article.updatedAt.toISOString(),
      })),
    };
  }
}
