import { GetArticleListQuery } from './get-article-list.query';

describe('GetArticleListQuery', () => {
  it('should create a GetArticleListQuery', () => {
    const query = new GetArticleListQuery();

    expect(query).toBeInstanceOf(GetArticleListQuery);
  });
});
