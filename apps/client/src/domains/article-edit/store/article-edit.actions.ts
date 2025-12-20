import { ArticleEditPageItem, FormModel } from '../model';

export class SetArticle {
  static readonly type = '[ArticleEdit] SetArticle';
  constructor(public article: FormModel) {}
}

export class SetPages {
  static readonly type = '[ArticleEdit] SetPages';
  constructor(public pages: ArticleEditPageItem[]) {}
}
