import { GetArticleQuery } from './get-article.query';

describe('GetArticleQuery', () => {
  it('should create a GetArticleQuery with valid parameters', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetArticleQuery(slug, currentUserId);

    expect(query).toBeInstanceOf(GetArticleQuery);
    expect(query.slug).toBe(slug);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should create a GetArticleQuery without currentUserId', () => {
    const slug = 'test-article-slug';
    const query = new GetArticleQuery(slug);

    expect(query).toBeInstanceOf(GetArticleQuery);
    expect(query.slug).toBe(slug);
    expect(query.currentUserId).toBeUndefined();
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const query = new GetArticleQuery(slug);

    expect(query.slug).toBe(slug);
  });
});
