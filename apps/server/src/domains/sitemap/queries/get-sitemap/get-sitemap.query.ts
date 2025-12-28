import { Query } from '@nestjs/cqrs';

import type { SitemapDto } from '$domains/sitemap/contracts';

export class GetSitemapQuery extends Query<SitemapDto> {
  constructor() {
    super();
  }
}
