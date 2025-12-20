export class GetPageRequest {
  pageId: string;
}

export class PageItem {
  id: string;
  title: string;
  level: number;
  order: number;
}

export class GetPageResponse {
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
  pages: PageItem[];
}
