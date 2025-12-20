import { Article } from '../model';

export class SetArticleList {
  static readonly type = '[ArticleList] Set';
  constructor(public articleList: Article[]) {}
}
