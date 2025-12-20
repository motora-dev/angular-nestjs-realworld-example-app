import { ArticlePage, ArticlePageItem, TocItem } from '../model';

export class SetArticlePageItems {
  static readonly type = '[ArticlePage] Set Items';
  constructor(public readonly pages: ArticlePageItem[]) {}
}

export class SetArticlePage {
  static readonly type = '[ArticlePage] Set Page';
  constructor(public readonly page: ArticlePage) {}
}

export class SetToc {
  static readonly type = '[ArticlePage] Set TOC';
  constructor(public readonly toc: TocItem[]) {}
}

export class SetScrollActiveTocId {
  static readonly type = '[ArticlePage] Set Scroll Active TOC ID';
  constructor(public readonly id: string | null) {}
}

export class SetClickedTocId {
  static readonly type = '[ArticlePage] Set Clicked TOC ID';
  constructor(public readonly id: string | null) {}
}
