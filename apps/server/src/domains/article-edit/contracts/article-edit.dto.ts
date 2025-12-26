import { ERROR_CODE } from '@monorepo/error-code';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

// Re-export from article domain
export { ArticleDto, AuthorDto, CommentDto } from '$domains/article/contracts';

/**
 * RealWorld API - Single Article Response
 */
export class SingleArticleDto {
  @ApiProperty({ description: 'Article object' })
  article: any; // Using any here to avoid circular import, actual type is ArticleDto
}

/**
 * Create Article Data (nested object for CreateArticleRequestDto)
 */
export class CreateArticleDto {
  @ApiProperty({ description: 'Article title', example: 'How to train your dragon' })
  @IsString({ message: ERROR_CODE.TITLE_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.TITLE_REQUIRED })
  @MinLength(1, { message: ERROR_CODE.TITLE_REQUIRED })
  title: string;

  @ApiProperty({ description: 'Article description', example: 'Ever wonder how?' })
  @IsString({ message: ERROR_CODE.DESCRIPTION_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.DESCRIPTION_REQUIRED })
  description: string;

  @ApiProperty({ description: 'Article body', example: 'It takes a Jacobian' })
  @IsString({ message: ERROR_CODE.BODY_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.BODY_REQUIRED })
  body: string;

  @ApiProperty({
    description: 'List of tags',
    example: ['dragons', 'training'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList?: string[];
}

/**
 * RealWorld API - Create Article Request
 * POST /api/articles
 */
export class CreateArticleRequestDto {
  @ApiProperty({ type: CreateArticleDto, description: 'Article data' })
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;
}

/**
 * Update Article Data (nested object for UpdateArticleRequestDto)
 */
export class UpdateArticleDto {
  @ApiProperty({ description: 'Article title', required: false, example: 'Updated title' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Article description', required: false, example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Article body', required: false, example: 'Updated body content' })
  @IsString()
  @IsOptional()
  body?: string;
}

/**
 * RealWorld API - Update Article Request
 * PUT /api/articles/:slug
 */
export class UpdateArticleRequestDto {
  @ApiProperty({ type: UpdateArticleDto, description: 'Article update data' })
  @ValidateNested()
  @Type(() => UpdateArticleDto)
  article: UpdateArticleDto;
}

/**
 * RealWorld API - Single Comment Response
 */
export class SingleCommentDto {
  @ApiProperty({ description: 'Comment object' })
  comment: any; // Using any here to avoid circular import, actual type is CommentDto
}

/**
 * Create Comment Data (nested object for CreateCommentRequestDto)
 */
export class CreateCommentDto {
  @ApiProperty({ description: 'Comment body', example: 'Great article!' })
  @IsString({ message: ERROR_CODE.COMMENT_BODY_REQUIRED })
  @IsNotEmpty({ message: ERROR_CODE.COMMENT_BODY_REQUIRED })
  @MinLength(1, { message: ERROR_CODE.COMMENT_BODY_REQUIRED })
  body: string;
}

/**
 * RealWorld API - Create Comment Request
 * POST /api/articles/:slug/comments
 */
export class CreateCommentRequestDto {
  @ApiProperty({ type: CreateCommentDto, description: 'Comment data' })
  @ValidateNested()
  @Type(() => CreateCommentDto)
  comment: CreateCommentDto;
}
