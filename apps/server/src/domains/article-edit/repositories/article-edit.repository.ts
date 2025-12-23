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
  async addFavorite(slug: string, userId: number): Promise<ArticleWithRelations> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    await this.prisma.favorite.upsert({
      where: {
        userId_articleId: { userId, articleId: article.id },
      },
      create: { userId, articleId: article.id },
      update: {},
    });

    return this.prisma.article.findUniqueOrThrow({
      where: { slug },
      include: articleWithRelationsInclude,
    });
  }

  /**
   * Remove favorite
   */
  async removeFavorite(slug: string, userId: number): Promise<ArticleWithRelations> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    await this.prisma.favorite.deleteMany({
      where: { userId, articleId: article.id },
    });

    return this.prisma.article.findUniqueOrThrow({
      where: { slug },
      include: articleWithRelationsInclude,
    });
  }

  /**
   * Create a comment
   */
  async createComment(slug: string, userId: number, body: string): Promise<CommentWithAuthor> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return this.prisma.comment.create({
      data: {
        body,
        articleId: article.id,
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
