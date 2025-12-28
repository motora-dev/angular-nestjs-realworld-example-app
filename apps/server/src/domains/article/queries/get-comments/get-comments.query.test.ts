import { GetCommentsQuery } from './get-comments.query';

describe('GetCommentsQuery', () => {
  it('should create a GetCommentsQuery with valid parameters', () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetCommentsQuery(slug, currentUserId);

    expect(query).toBeInstanceOf(GetCommentsQuery);
    expect(query.slug).toBe(slug);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should create a GetCommentsQuery without currentUserId', () => {
    const slug = 'test-article-slug';
    const query = new GetCommentsQuery(slug);

    expect(query).toBeInstanceOf(GetCommentsQuery);
    expect(query.slug).toBe(slug);
    expect(query.currentUserId).toBeUndefined();
  });

  it('should set slug property correctly', () => {
    const slug = 'specific-test-slug';
    const query = new GetCommentsQuery(slug);

    expect(query.slug).toBe(slug);
  });
});
