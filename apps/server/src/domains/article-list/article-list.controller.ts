import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GetArticlesQuery, GetFeedQuery, GetTagsQuery } from './queries';

import type { GetArticlesQueryDto, GetFeedQueryDto, MultipleArticlesDto, TagsDto } from './contracts';

// TODO: Create and import proper auth guard
// import { OptionalAuthGuard, AuthGuard } from '$guards';

@Controller('api')
export class ArticleListController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /api/articles
   * Get recent articles globally
   * Auth is optional
   */
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
  @Get('articles/feed')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard) // TODO: Enable auth guard
  async getFeed(@Query() query: GetFeedQueryDto, @CurrentUser() user: CurrentUserType): Promise<MultipleArticlesDto> {
    // TODO: Return 401 if user is not authenticated
    if (!user) {
      return { articles: [], articlesCount: 0 };
    }
    return this.queryBus.execute(new GetFeedQuery(query, user.id));
  }

  /**
   * GET /api/tags
   * Get tags
   * Auth not required
   */
  @Get('tags')
  @HttpCode(HttpStatus.OK)
  async getTags(): Promise<TagsDto> {
    return this.queryBus.execute(new GetTagsQuery());
  }
}
