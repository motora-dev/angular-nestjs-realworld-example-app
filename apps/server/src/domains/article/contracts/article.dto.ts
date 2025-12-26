import { ApiProperty } from '@nestjs/swagger';

/**
 * RealWorld API - Author (Profile) DTO
 */
export class AuthorDto {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'User bio', example: 'I like to code', nullable: true })
  bio: string | null;

  @ApiProperty({ description: 'User image URL', example: 'https://example.com/avatar.jpg', nullable: true })
  image: string | null;

  @ApiProperty({ description: 'Whether the current user is following this author', example: false })
  following: boolean;
}

/**
 * RealWorld API - Article DTO
 */
export class ArticleDto {
  @ApiProperty({ description: 'Article slug', example: 'how-to-train-your-dragon' })
  slug: string;

  @ApiProperty({ description: 'Article title', example: 'How to train your dragon' })
  title: string;

  @ApiProperty({ description: 'Article description', example: 'Ever wonder how?', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Article body', example: 'It takes a Jacobian' })
  body: string;

  @ApiProperty({ description: 'List of tags', example: ['dragons', 'training'], type: [String] })
  tagList: string[];

  @ApiProperty({ description: 'Creation date (ISO 8601)', example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)', example: '2024-01-02T00:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ description: 'Whether the current user favorited this article', example: false })
  favorited: boolean;

  @ApiProperty({ description: 'Number of users who favorited this article', example: 5 })
  favoritesCount: number;

  @ApiProperty({ type: AuthorDto, description: 'Article author' })
  author: AuthorDto;
}

/**
 * RealWorld API - Single Article Response
 * GET /api/articles/:slug
 */
export class SingleArticleDto {
  @ApiProperty({ type: ArticleDto, description: 'Article object' })
  article: ArticleDto;
}

/**
 * RealWorld API - Comment DTO
 */
export class CommentDto {
  @ApiProperty({ description: 'Comment ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Creation date (ISO 8601)', example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)', example: '2024-01-02T00:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ description: 'Comment body', example: 'Great article!' })
  body: string;

  @ApiProperty({ type: AuthorDto, description: 'Comment author' })
  author: AuthorDto;
}

/**
 * RealWorld API - Multiple Comments Response
 * GET /api/articles/:slug/comments
 */
export class MultipleCommentsDto {
  @ApiProperty({ type: [CommentDto], description: 'List of comments' })
  comments: CommentDto[];
}
