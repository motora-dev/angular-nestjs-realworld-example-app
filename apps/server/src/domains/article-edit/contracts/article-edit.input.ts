/**
 * Repository input params
 */
export interface CreateArticleParams {
  title: string;
  description: string;
  body: string;
  tagList: string[];
  userId: number;
}

export interface UpdateArticleParams {
  title?: string;
  description?: string;
  body?: string;
}
