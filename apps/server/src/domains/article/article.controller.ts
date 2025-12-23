import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { CurrentUser } from '$decorators';
import { GetArticleQuery, GetCommentsQuery } from './queries';

import type { MultipleCommentsDto, SingleArticleDto } from './dto';

interface CurrentUserType {
  id: number;
  username: string;
}

@Controller('api/articles')
export class ArticleController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /api/articles/:slug
   * Get an article
   * Auth not required
   */
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
  @Get(':slug/comments')
  @HttpCode(HttpStatus.OK)
  async getComments(@Param('slug') slug: string, @CurrentUser() user?: CurrentUserType): Promise<MultipleCommentsDto> {
    return this.queryBus.execute(new GetCommentsQuery(slug, user?.id));
  }
}
