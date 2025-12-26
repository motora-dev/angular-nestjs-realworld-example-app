import { Injectable } from '@nestjs/common';

import { SitemapDto } from '../contracts';
import { SitemapRepository } from '../repositories';

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
