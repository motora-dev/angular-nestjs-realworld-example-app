export interface ArticleResponse {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: string;
}

export interface ArticleListResponse {
  articleList: ArticleResponse[];
}
