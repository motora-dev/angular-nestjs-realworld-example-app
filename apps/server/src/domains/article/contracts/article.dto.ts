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
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: AuthorDto;
}

/**
 * RealWorld API - Single Article Response
 * GET /api/articles/:slug
 */
export interface SingleArticleDto {
  article: ArticleDto;
}

/**
 * RealWorld API - Comment DTO
 */
export interface CommentDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: AuthorDto;
}

/**
 * RealWorld API - Multiple Comments Response
 * GET /api/articles/:slug/comments
 */
export interface MultipleCommentsDto {
  comments: CommentDto[];
}
