import { Query } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';
import { GetArticleForEditQuery } from './get-article-for-edit.query';

describe('GetArticleForEditQuery', () => {
  it('should create a GetArticleForEditQuery with correct properties and extend Query', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetArticleForEditQuery(slug, currentUserId);

    expect(query).toBeInstanceOf(GetArticleForEditQuery);
    expect(query).toBeInstanceOf(Query<SingleArticleDto>);
    expect(query.slug).toBe(slug);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const currentUserId = 1;
    const query = new GetArticleForEditQuery(slug, currentUserId);

    expect(query.slug).toBe(slug);
  });

  it('should set currentUserId property correctly', () => {
    const slug = 'test-article-slug';
    const currentUserId = 2;
    const query = new GetArticleForEditQuery(slug, currentUserId);

    expect(query.currentUserId).toBe(currentUserId);
  });
});
