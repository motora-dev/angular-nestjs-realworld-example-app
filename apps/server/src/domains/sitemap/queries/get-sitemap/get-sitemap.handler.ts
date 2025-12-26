import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetSitemapQuery } from './get-sitemap.query';
import { SitemapDto } from '../../contracts';
import { SitemapService } from '../../services';

@QueryHandler(GetSitemapQuery)
export class GetSitemapHandler implements IQueryHandler<GetSitemapQuery> {
  constructor(private readonly sitemapService: SitemapService) {}

  async execute(): Promise<SitemapDto> {
    return await this.sitemapService.getSitemap();
  }
}
