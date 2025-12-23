import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { PrismaAdapter } from '$adapters';
import {
  articleWithRelationsInclude,
  commentWithAuthorInclude,
  type ArticleWithRelations,
  type CommentWithAuthor,
  type CreateArticleParams,
  type UpdateArticleParams,
} from '../contracts';

@Injectable()
export class ArticleEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Create a new article
   */
  async create(params: CreateArticleParams): Promise<ArticleWithRelations> {
    const slug = createId();

    return this.prisma.article.create({
      data: {
        slug,
        title: params.title,
        description: params.description,
        body: params.body,
        tags: params.tagList,
        userId: params.userId,
      },
      include: articleWithRelationsInclude,
    });
  }

  /**
   * Update an article
   */
  async update(slug: string, params: UpdateArticleParams): Promise<ArticleWithRelations> {
    return this.prisma.article.update({
      where: { slug },
      data: {
        title: params.title,
        description: params.description,
        body: params.body,
      },
      include: articleWithRelationsInclude,
    });
  }

  /**
   * Delete an article
   */
  async delete(slug: string): Promise<void> {
    await this.prisma.article.delete({
      where: { slug },
    });
  }

  /**
   * Add favorite
   */
  async addFavorite(articleId: number, userId: number): Promise<void> {
    await this.prisma.favorite.upsert({
      where: {
        userId_articleId: { userId, articleId },
      },
      create: { userId, articleId },
      update: {},
    });
  }

  /**
   * Remove favorite
   */
  async removeFavorite(articleId: number, userId: number): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, articleId },
    });
  }

  /**
   * Create a comment
   */
  async createComment(articleId: number, userId: number, body: string): Promise<CommentWithAuthor> {
    return this.prisma.comment.create({
      data: {
        body,
        articleId,
        userId,
      },
      include: commentWithAuthorInclude,
    });
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number, userId: number): Promise<void> {
    await this.prisma.comment.deleteMany({
      where: { id: commentId, userId },
    });
  }
}
