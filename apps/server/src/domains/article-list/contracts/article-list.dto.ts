import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

// Re-export from article domain
export { ArticleDto, AuthorDto } from '$domains/article/contracts';

/**
 * RealWorld API - Multiple Articles Response
 * GET /api/articles, GET /api/articles/feed
 */
export class MultipleArticlesDto {
  @ApiProperty({ type: [Object], description: 'List of articles' })
  articles: any[]; // Using any[] to avoid circular import, actual type is ArticleDto[]

  @ApiProperty({ description: 'Total number of articles', example: 10 })
  articlesCount: number;
}

/**
 * RealWorld API - Tags Response
 * GET /api/tags
 */
export class TagsDto {
  @ApiProperty({
    description: 'List of tags',
    example: ['dragons', 'training', 'coding'],
    type: [String],
  })
  tags: string[];
}

/**
 * Query parameters for GET /api/articles
 */
export class GetArticlesQueryDto {
  @ApiProperty({ description: 'Filter by tag', required: false, example: 'dragons' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiProperty({ description: 'Filter by author username', required: false, example: 'john_doe' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: 'Filter by favorited username', required: false, example: 'jane_doe' })
  @IsString()
  @IsOptional()
  favorited?: string;

  @ApiProperty({ description: 'Offset for pagination', required: false, example: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiProperty({ description: 'Limit for pagination', required: false, example: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

/**
 * Query parameters for GET /api/articles/feed
 */
export class GetFeedQueryDto {
  @ApiProperty({ description: 'Offset for pagination', required: false, example: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiProperty({ description: 'Limit for pagination', required: false, example: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
