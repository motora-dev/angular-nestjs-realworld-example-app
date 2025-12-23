/**
 * RealWorld API - Author (Profile) DTO
 */
export interface AuthorDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

/**
 * RealWorld API - Article DTO
 */
export interface ArticleDto {
  slug: string;
  title: string;
  description: string | null;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: AuthorDto;
}

/**
 * RealWorld API - Multiple Articles Response
 * GET /api/articles, GET /api/articles/feed
 */
export interface MultipleArticlesDto {
  articles: ArticleDto[];
  articlesCount: number;
}

/**
 * RealWorld API - Tags Response
 * GET /api/tags
 */
export interface TagsDto {
  tags: string[];
}

/**
 * Query parameters for GET /api/articles
 */
export interface GetArticlesQueryDto {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
}

/**
 * Query parameters for GET /api/articles/feed
 */
export interface GetFeedQueryDto {
  offset?: number;
  limit?: number;
}
