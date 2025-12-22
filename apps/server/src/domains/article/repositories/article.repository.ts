import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

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
   * Get comments for an article
   */
  async getComments(slug: string): Promise<CommentWithAuthor[]> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return [];
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      orderBy: { createdAt: 'desc' },
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

    return comments as CommentWithAuthor[];
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
