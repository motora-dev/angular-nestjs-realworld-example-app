import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

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
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
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
      throw new NotFoundException('Article not found');
    }

    if (existingArticle.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
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
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
    }

    await this.repository.delete(slug);
  }

  /**
   * Favorite an article
   */
  async favoriteArticle(slug: string, currentUserId: number): Promise<ArticleWithRelations> {
    return this.repository.addFavorite(slug, currentUserId);
  }

  /**
   * Unfavorite an article
   */
  async unfavoriteArticle(slug: string, currentUserId: number): Promise<ArticleWithRelations> {
    return this.repository.removeFavorite(slug, currentUserId);
  }

  /**
   * Create a comment
   */
  async createComment(
    slug: string,
    request: CreateCommentRequestDto,
    currentUserId: number,
  ): Promise<CommentWithAuthor> {
    return this.repository.createComment(slug, currentUserId, request.comment.body);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number, currentUserId: number): Promise<void> {
    const comment = await this.queryRepository.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== currentUserId) {
      throw new ForbiddenException('You are not the author of this comment');
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
