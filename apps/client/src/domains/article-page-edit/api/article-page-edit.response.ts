export interface GetPagesPageItemResponse {
  id: string;
  title: string;
  level: number;
  order: number;
}

export interface GetPagesResponse {
  pages: GetPagesPageItemResponse[];
}

export interface GetPageResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
}

export interface UpdatePageRequest {
  title: string;
  description: string;
  content: string;
}

export interface UpdatePageResponse {
  id: string;
  title: string;
  description: string;
  content: string;
  level: number;
  order: number;
}
