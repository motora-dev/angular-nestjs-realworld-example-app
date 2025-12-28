import { Query } from '@nestjs/cqrs';

import type { SitemapDto } from '$domains/sitemap/contracts';
import { GetSitemapQuery } from './get-sitemap.query';

describe('GetSitemapQuery', () => {
  it('should create a GetSitemapQuery and extend Query', () => {
    const query = new GetSitemapQuery();

    expect(query).toBeInstanceOf(GetSitemapQuery);
    expect(query).toBeInstanceOf(Query<SitemapDto>);
  });
});
