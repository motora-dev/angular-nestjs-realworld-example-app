import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import {
  CreateArticleCommand,
  CreateCommentCommand,
  DeleteArticleCommand,
  DeleteCommentCommand,
  FavoriteArticleCommand,
  UnfavoriteArticleCommand,
  UpdateArticleCommand,
} from './commands';
import { GetArticleForEditQuery } from './queries';

import type {
  CreateArticleRequestDto,
  CreateCommentRequestDto,
  SingleArticleDto,
  SingleCommentDto,
  UpdateArticleRequestDto,
} from './contracts';

@Controller('api/articles')
export class ArticleEditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * POST /api/articles
   * Create an article
   * Auth is required
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createArticle(
    @Body() request: CreateArticleRequestDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<SingleArticleDto> {
    return this.commandBus.execute(new CreateArticleCommand(request, user.id));
  }

  /**
   * GET /api/articles/:slug/edit
   * Get an article for editing (must be owner)
   * Auth is required
   */
  @Get(':slug/edit')
  @HttpCode(HttpStatus.OK)
  async getArticleForEdit(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<SingleArticleDto> {
    return this.queryBus.execute(new GetArticleForEditQuery(slug, user.id));
  }

  /**
   * PUT /api/articles/:slug
   * Update an article
   * Auth is required
   */
  @Put(':slug')
  @HttpCode(HttpStatus.OK)
  async updateArticle(
    @Param('slug') slug: string,
    @Body() request: UpdateArticleRequestDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<SingleArticleDto> {
    return this.commandBus.execute(new UpdateArticleCommand(slug, request, user.id));
  }

  /**
   * DELETE /api/articles/:slug
   * Delete an article
   * Auth is required
   */
  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArticle(@Param('slug') slug: string, @CurrentUser() user: CurrentUserType): Promise<void> {
    return this.commandBus.execute(new DeleteArticleCommand(slug, user.id));
  }

  /**
   * POST /api/articles/:slug/favorite
   * Favorite an article
   * Auth is required
   */
  @Post(':slug/favorite')
  @HttpCode(HttpStatus.OK)
  async favoriteArticle(@Param('slug') slug: string, @CurrentUser() user: CurrentUserType): Promise<SingleArticleDto> {
    return this.commandBus.execute(new FavoriteArticleCommand(slug, user.id));
  }

  /**
   * DELETE /api/articles/:slug/favorite
   * Unfavorite an article
   * Auth is required
   */
  @Delete(':slug/favorite')
  @HttpCode(HttpStatus.OK)
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserType,
  ): Promise<SingleArticleDto> {
    return this.commandBus.execute(new UnfavoriteArticleCommand(slug, user.id));
  }

  /**
   * POST /api/articles/:slug/comments
   * Add comment to an article
   * Auth is required
   */
  @Post(':slug/comments')
  @HttpCode(HttpStatus.OK)
  async createComment(
    @Param('slug') slug: string,
    @Body() request: CreateCommentRequestDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<SingleCommentDto> {
    return this.commandBus.execute(new CreateCommentCommand(slug, request, user.id));
  }

  /**
   * DELETE /api/articles/:slug/comments/:id
   * Delete a comment
   * Auth is required
   */
  @Delete(':slug/comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @CurrentUser() user: CurrentUserType,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, user.id));
  }
}
