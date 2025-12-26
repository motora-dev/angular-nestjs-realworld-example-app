import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { GetArticlesQueryDto, GetFeedQueryDto, MultipleArticlesDto, TagsDto } from './contracts';
import { GetArticlesQuery, GetFeedQuery, GetTagsQuery } from './queries';

@ApiTags('Article List')
@Controller()
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /api/articles
   * Get recent articles globally
   * Auth is optional
   */
  @ApiOperation({
    summary: 'Get articles',
    description: 'Get recent articles globally with optional filters (auth optional)',
  })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author username' })
  @ApiQuery({ name: 'favorited', required: false, description: 'Filter by favorited username' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit for pagination', type: Number })
  @ApiOkResponse({ description: 'Articles retrieved successfully', type: MultipleArticlesDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @Get('articles')
  @HttpCode(HttpStatus.OK)
  async getArticles(
    @Query() query: GetArticlesQueryDto,
    @CurrentUser() user?: CurrentUserType,
  ): Promise<MultipleArticlesDto> {
    return this.queryBus.execute(new GetArticlesQuery(query, user?.id));
  }

  /**
   * GET /api/articles/feed
   * Get recent articles from users you follow
   * Auth is required
   */
  @ApiOperation({
    summary: 'Get feed',
    description: 'Get recent articles from users you follow (requires authentication)',
  })
  @ApiBearerAuth()
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit for pagination', type: Number })
  @ApiOkResponse({ description: 'Feed retrieved successfully', type: MultipleArticlesDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @UseGuards(GoogleAuthGuard)
  @Get('articles/feed')
  @HttpCode(HttpStatus.OK)
  async getFeed(@Query() query: GetFeedQueryDto, @CurrentUser() user: CurrentUserType): Promise<MultipleArticlesDto> {
    return this.queryBus.execute(new GetFeedQuery(query, user.id));
  }

  /**
   * GET /api/tags
   * Get tags
   * Auth not required
   */
  @ApiOperation({
    summary: 'Get tags',
    description: 'Get all tags',
  })
  @ApiOkResponse({ description: 'Tags retrieved successfully', type: TagsDto })
  @Get('tags')
  @HttpCode(HttpStatus.OK)
  async getTags(): Promise<TagsDto> {
    return this.queryBus.execute(new GetTagsQuery());
  }
}
