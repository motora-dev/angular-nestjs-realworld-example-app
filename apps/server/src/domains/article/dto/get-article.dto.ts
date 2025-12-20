export class GetArticleRequest {
  articleId: string;
}

export class GetArticleResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  tags: string[];
  description: string;
}
