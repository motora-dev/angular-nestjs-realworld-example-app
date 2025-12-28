import { Query } from '@nestjs/cqrs';

import type { MultipleArticlesDto } from '$domains/article-list/contracts';
import { GetArticlesQuery } from './get-articles.query';

describe('GetArticlesQuery', () => {
  const mockParams = {
    tag: 'test-tag',
    author: 'test-author',
    favorited: 'test-user',
    offset: 0,
    limit: 20,
  };

  it('should create a GetArticlesQuery with correct properties and extend Query', () => {
    const currentUserId = 1;
    const query = new GetArticlesQuery(mockParams, currentUserId);

    expect(query).toBeInstanceOf(GetArticlesQuery);
    expect(query).toBeInstanceOf(Query<MultipleArticlesDto>);
    expect(query.params).toEqual(mockParams);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should create a GetArticlesQuery without currentUserId', () => {
    const query = new GetArticlesQuery(mockParams);

    expect(query).toBeInstanceOf(GetArticlesQuery);
    expect(query).toBeInstanceOf(Query<MultipleArticlesDto>);
    expect(query.params).toEqual(mockParams);
    expect(query.currentUserId).toBeUndefined();
  });

  it('should set params property correctly', () => {
    const query = new GetArticlesQuery(mockParams);

    expect(query.params).toEqual(mockParams);
  });
});
