/**
 * Repository input params
 */
export interface GetArticlesParams {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
  currentUserId?: number;
}

export interface GetFeedParams {
  offset?: number;
  limit?: number;
  currentUserId: number;
}
