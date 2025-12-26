import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import type { CurrentUserType } from '$decorators';
import { CurrentUser } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import {
  CreateArticleCommand,
  CreateCommentCommand,
  DeleteArticleCommand,
  DeleteCommentCommand,
  FavoriteArticleCommand,
  UnfavoriteArticleCommand,
  UpdateArticleCommand,
} from './commands';
import {
  CreateArticleRequestDto,
  CreateCommentRequestDto,
  SingleArticleDto,
  SingleCommentDto,
  UpdateArticleRequestDto,
} from './contracts';
import { GetArticleForEditQuery } from './queries';

@ApiTags('Article Edit')
@ApiBearerAuth()
@Controller('articles')
@UseGuards(GoogleAuthGuard)
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
  @ApiOperation({
    summary: 'Create an article',
    description: 'Create a new article (requires authentication)',
  })
  @ApiBody({ type: CreateArticleRequestDto })
  @ApiCreatedResponse({ description: 'Article created successfully', type: SingleArticleDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
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
  @ApiOperation({
    summary: 'Get article for editing',
    description: 'Get an article for editing (must be the author)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiOkResponse({ description: 'Article retrieved successfully', type: SingleArticleDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the article author' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Update an article',
    description: 'Update an existing article (must be the author)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiBody({ type: UpdateArticleRequestDto })
  @ApiOkResponse({ description: 'Article updated successfully', type: SingleArticleDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the article author' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Delete an article',
    description: 'Delete an article (must be the author)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiNoContentResponse({ description: 'Article deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the article author' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Favorite an article',
    description: 'Mark an article as favorited',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiOkResponse({ description: 'Article favorited successfully', type: SingleArticleDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Unfavorite an article',
    description: 'Remove favorite mark from an article',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiOkResponse({ description: 'Article unfavorited successfully', type: SingleArticleDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Add a comment',
    description: 'Add a comment to an article',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiBody({ type: CreateCommentRequestDto })
  @ApiOkResponse({ description: 'Comment created successfully', type: SingleCommentDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'Article not found' })
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
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete a comment (must be the comment author)',
  })
  @ApiParam({ name: 'slug', description: 'Article slug', example: 'how-to-train-your-dragon' })
  @ApiParam({ name: 'id', description: 'Comment ID', example: 1 })
  @ApiNoContentResponse({ description: 'Comment deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Not the comment author' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @Delete(':slug/comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @CurrentUser() user: CurrentUserType,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, user.id));
  }
}
