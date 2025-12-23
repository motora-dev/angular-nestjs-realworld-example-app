import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { ForbiddenError, NotFoundError } from '$errors';
import { ArticleEditQueryRepository } from '../repositories/article-edit-query.repository';
import { ArticleEditRepository } from '../repositories/article-edit.repository';

import type { ArticleWithRelations, CommentWithAuthor } from '../contracts';
import type { CreateArticleRequestDto, CreateCommentRequestDto, UpdateArticleRequestDto } from '../contracts';

@Injectable()
export class ArticleEditService {
  constructor(
    private readonly repository: ArticleEditRepository,
    private readonly queryRepository: ArticleEditQueryRepository,
  ) {}

  /**
   * Create a new article
   */
  async createArticle(request: CreateArticleRequestDto, currentUserId: number): Promise<ArticleWithRelations> {
    return this.repository.create({
      title: request.article.title,
      description: request.article.description,
      body: request.article.body,
      tagList: request.article.tagList || [],
      userId: currentUserId,
    });
  }

  /**
   * Get article for editing (must be owner)
   */
  async getArticleForEdit(slug: string, currentUserId: number): Promise<ArticleWithRelations> {
    const article = await this.queryRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenError(ERROR_CODE.FORBIDDEN);
    }

    return article;
  }

  /**
   * Update an article
   */
  async updateArticle(
    slug: string,
    request: UpdateArticleRequestDto,
    currentUserId: number,
  ): Promise<ArticleWithRelations> {
    const existingArticle = await this.queryRepository.getBySlug(slug);

    if (!existingArticle) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (existingArticle.userId !== currentUserId) {
      throw new ForbiddenError(ERROR_CODE.FORBIDDEN);
    }

    return this.repository.update(slug, {
      title: request.article.title,
      description: request.article.description,
      body: request.article.body,
    });
  }

  /**
   * Delete an article
   */
  async deleteArticle(slug: string, currentUserId: number): Promise<void> {
    const article = await this.queryRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenError(ERROR_CODE.FORBIDDEN);
    }

    await this.repository.delete(slug);
  }

  /**
   * Favorite an article
   */
  async favoriteArticle(slug: string, currentUserId: number): Promise<ArticleWithRelations> {
    const article = await this.queryRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    await this.repository.addFavorite(article.id, currentUserId);

    return (await this.queryRepository.getBySlug(slug))!;
  }

  /**
   * Unfavorite an article
   */
  async unfavoriteArticle(slug: string, currentUserId: number): Promise<ArticleWithRelations> {
    const article = await this.queryRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    await this.repository.removeFavorite(article.id, currentUserId);

    return (await this.queryRepository.getBySlug(slug))!;
  }

  /**
   * Create a comment
   */
  async createComment(
    slug: string,
    request: CreateCommentRequestDto,
    currentUserId: number,
  ): Promise<CommentWithAuthor> {
    const article = await this.queryRepository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    return this.repository.createComment(article.id, currentUserId, request.comment.body);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number, currentUserId: number): Promise<void> {
    const comment = await this.queryRepository.getComment(commentId);

    if (!comment) {
      throw new NotFoundError(ERROR_CODE.COMMENT_NOT_FOUND);
    }

    if (comment.user.id !== currentUserId) {
      throw new ForbiddenError(ERROR_CODE.FORBIDDEN);
    }

    await this.repository.deleteComment(commentId, currentUserId);
  }

  /**
   * Check if user is following another user
   * (exposed for handlers to use in DTO conversion)
   */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return this.queryRepository.isFollowing(followerId, followingId);
  }
}
