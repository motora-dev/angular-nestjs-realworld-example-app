import { GetArticleQuery } from './get-article.query';

describe('GetArticleQuery', () => {
  it('should create a GetArticleQuery with a valid id', () => {
    const id = 'test-article-id';
    const query = new GetArticleQuery(id);

    expect(query).toBeInstanceOf(GetArticleQuery);
    expect(query.articleId).toBe(id);
  });

  it('should set articleId property correctly', () => {
    const id = 'specific-test-id';
    const query = new GetArticleQuery(id);

    expect(query.articleId).toBe(id);
  });
});
