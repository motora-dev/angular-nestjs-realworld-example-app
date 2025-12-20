import { FormModel, PageItem } from '../model';

export class SetPages {
  static readonly type = '[ArticlePageEdit] SetPages';
  constructor(public pages: PageItem[]) {}
}

export class SetPage {
  static readonly type = '[ArticlePageEdit] SetCurrentPage';
  constructor(public page: FormModel | null) {}
}
