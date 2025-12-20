export class ArticleDto {
  id: string;
  title: string | null;
  tags: string[];
  createdAt: Date;
}

export class ArticleListDto {
  articleList: ArticleDto[];
}
