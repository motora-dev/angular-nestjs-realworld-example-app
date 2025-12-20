export class GetPagesPageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export class GetArticleResponseDto {
  id: string;
  title: string;
  tags: string[];
  description: string;
  pages: GetPagesPageItem[];
}
