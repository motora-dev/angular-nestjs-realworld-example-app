export interface ArticlePageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface ArticlePage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  articleId: string;
  content: string;
  level: number;
  order: number;
  tags: string[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}
