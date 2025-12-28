import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetSitemapQuery } from '$domains/sitemap/queries/get-sitemap/get-sitemap.query';
import { SitemapService } from '$domains/sitemap/services/sitemap.service';

@QueryHandler(GetSitemapQuery)
export class GetSitemapHandler implements IQueryHandler<GetSitemapQuery> {
  constructor(private readonly sitemapService: SitemapService) {}

  async execute() {
    return await this.sitemapService.getSitemap();
  }
}
