import { Article, ArticleListConfig } from '$domains/article';

export class SetTags {
  static readonly type = '[Home] Set Tags';
  constructor(public tags: string[]) {}
}

export class SetArticles {
  static readonly type = '[Home] Set Articles';
  constructor(
    public articles: Article[],
    public articlesCount: number,
  ) {}
}

export class SetListConfig {
  static readonly type = '[Home] Set List Config';
  constructor(public config: ArticleListConfig) {}
}
