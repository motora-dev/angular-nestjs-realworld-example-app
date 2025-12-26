import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { MultipleCommentsDto, SingleArticleDto } from './contracts';
import { GetArticleQuery, GetCommentsQuery } from './queries';

@ApiTags('Article')
@Controller('articles')
export class ArticleController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /api/articles/:slug
   * Get an article
   * Auth not required
   */
  @ApiOperation({
    summary: 'Get an article',
    description: 'Get an article by slug (auth optional)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiOkResponse({ description: 'Article retrieved successfully', type: SingleArticleDto })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async getArticle(@Param('slug') slug: string, @CurrentUser() user?: CurrentUserType): Promise<SingleArticleDto> {
    return this.queryBus.execute(new GetArticleQuery(slug, user?.id));
  }

  /**
   * GET /api/articles/:slug/comments
   * Get comments for an article
   * Auth is optional
   */
  @ApiOperation({
    summary: 'Get article comments',
    description: 'Get comments for an article by slug (auth optional)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiOkResponse({ description: 'Comments retrieved successfully', type: MultipleCommentsDto })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @Get(':slug/comments')
  @HttpCode(HttpStatus.OK)
  async getComments(@Param('slug') slug: string, @CurrentUser() user?: CurrentUserType): Promise<MultipleCommentsDto> {
    return this.queryBus.execute(new GetCommentsQuery(slug, user?.id));
  }
}
