import { Query } from '@nestjs/cqrs';

import type { TagsDto } from '$domains/article-list/contracts';
import { GetTagsQuery } from './get-tags.query';

describe('GetTagsQuery', () => {
  it('should create a GetTagsQuery and extend Query', () => {
    const query = new GetTagsQuery();

    expect(query).toBeInstanceOf(GetTagsQuery);
    expect(query).toBeInstanceOf(Query<TagsDto>);
  });
});
