import { Article } from '../model';

export class SetArticle {
  static readonly type = '[Article] Set Article';
  constructor(public article: Article | null) {}
}

export class ClearArticle {
  static readonly type = '[Article] Clear Article';
}
