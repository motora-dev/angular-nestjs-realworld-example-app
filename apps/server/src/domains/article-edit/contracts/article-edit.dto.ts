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
 */
export interface SingleArticleDto {
  article: ArticleDto;
}

/**
 * RealWorld API - Create Article Request
 * POST /api/articles
 */
export interface CreateArticleRequestDto {
  article: {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
  };
}

/**
 * RealWorld API - Update Article Request
 * PUT /api/articles/:slug
 */
export interface UpdateArticleRequestDto {
  article: {
    title?: string;
    description?: string;
    body?: string;
  };
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
 * RealWorld API - Single Comment Response
 */
export interface SingleCommentDto {
  comment: CommentDto;
}

/**
 * RealWorld API - Create Comment Request
 * POST /api/articles/:slug/comments
 */
export interface CreateCommentRequestDto {
  comment: {
    body: string;
  };
}
