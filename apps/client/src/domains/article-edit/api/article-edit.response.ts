export interface GetPagesPageItemResponse {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface GetArticleResponse {
  id: string;
  title: string;
  tags: string[];
  description: string; // Markdown content
  pages: GetPagesPageItemResponse[];
}

export interface UpdateArticleRequest {
  title: string;
  tags: string[];
  content: string; // Markdown content
}

export interface UpdateArticleResponse {
  id: string;
  title: string;
  tags: string[];
  description: string;
}
