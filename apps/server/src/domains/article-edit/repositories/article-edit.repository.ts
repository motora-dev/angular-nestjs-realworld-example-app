import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { PrismaAdapter } from '$adapters';

export interface ArticleWithRelations {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
  };
  favorites: { userId: number }[];
  _count: { favorites: number };
}

export interface CommentWithAuthor {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  user: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
  };
}

export interface CreateArticleParams {
  title: string;
  description: string;
  body: string;
  tagList: string[];
  userId: number;
}

export interface UpdateArticleParams {
  title?: string;
  description?: string;
  body?: string;
}

@Injectable()
export class ArticleEditRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Create a new article
   */
  async create(params: CreateArticleParams): Promise<ArticleWithRelations> {
    const slug = createId();

    const article = await this.prisma.article.create({
      data: {
        slug,
        title: params.title,
        description: params.description,
        body: params.body,
        tags: params.tagList,
        userId: params.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
        favorites: {
          select: { userId: true },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    return article as ArticleWithRelations;
  }

  /**
   * Get article by slug
   */
  async getBySlug(slug: string): Promise<ArticleWithRelations | null> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
        favorites: {
          select: { userId: true },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    return article as ArticleWithRelations | null;
  }

  /**
   * Update an article
   */
  async update(
    slug: string,
    params: UpdateArticleParams,
  ): Promise<ArticleWithRelations> {
    const article = await this.prisma.article.update({
      where: { slug },
      data: {
        title: params.title,
        description: params.description,
        body: params.body,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
        favorites: {
          select: { userId: true },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    return article as ArticleWithRelations;
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
  async addFavorite(
    slug: string,
    userId: number,
  ): Promise<ArticleWithRelations> {
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

    return (await this.getBySlug(slug))!;
  }

  /**
   * Remove favorite
   */
  async removeFavorite(
    slug: string,
    userId: number,
  ): Promise<ArticleWithRelations> {
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

    return (await this.getBySlug(slug))!;
  }

  /**
   * Create a comment
   */
  async createComment(
    slug: string,
    userId: number,
    body: string,
  ): Promise<CommentWithAuthor> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        body,
        articleId: article.id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return comment as CommentWithAuthor;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number, userId: number): Promise<void> {
    await this.prisma.comment.deleteMany({
      where: { id: commentId, userId },
    });
  }

  /**
   * Get comment by id
   */
  async getComment(commentId: number): Promise<CommentWithAuthor | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return comment as CommentWithAuthor | null;
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    return !!follow;
  }
}
