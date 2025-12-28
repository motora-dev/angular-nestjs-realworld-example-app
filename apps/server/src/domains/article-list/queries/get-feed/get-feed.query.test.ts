import { Query } from '@nestjs/cqrs';

import type { MultipleArticlesDto } from '$domains/article-list/contracts';
import { GetFeedQuery } from './get-feed.query';

describe('GetFeedQuery', () => {
  const mockParams = {
    offset: 0,
    limit: 20,
  };

  it('should create a GetFeedQuery with correct properties and extend Query', () => {
    const currentUserId = 1;
    const query = new GetFeedQuery(mockParams, currentUserId);

    expect(query).toBeInstanceOf(GetFeedQuery);
    expect(query).toBeInstanceOf(Query<MultipleArticlesDto>);
    expect(query.params).toEqual(mockParams);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should set params property correctly', () => {
    const currentUserId = 1;
    const query = new GetFeedQuery(mockParams, currentUserId);

    expect(query.params).toEqual(mockParams);
  });

  it('should set currentUserId property correctly', () => {
    const currentUserId = 2;
    const query = new GetFeedQuery(mockParams, currentUserId);

    expect(query.currentUserId).toBe(currentUserId);
  });
});
