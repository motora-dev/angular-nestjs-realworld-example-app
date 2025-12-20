export interface ArticlePageItemResponse {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface ArticlePageResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  articleId: string;
  content: string;
  level: number;
  order: number;
  tags: string[];
  pages: ArticlePageItemResponse[];
}
