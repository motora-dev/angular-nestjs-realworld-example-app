import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

export interface GetArticlesParams {
  tag?: string;
  author?: string;
  favorited?: string;
  offset?: number;
  limit?: number;
  currentUserId?: number;
}

export interface GetFeedParams {
  offset?: number;
  limit?: number;
  currentUserId: number;
}

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

@Injectable()
export class ArticleListRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get articles with filters and pagination
   */
  async getArticles(params: GetArticlesParams): Promise<{
    articles: ArticleWithRelations[];
    count: number;
  }> {
    const { tag, author, favorited, offset = 0, limit = 20 } = params;

    const where: any = {};

    // Filter by tag
    if (tag) {
      where.tags = { has: tag };
    }

    // Filter by author username
    if (author) {
      where.user = { username: author };
    }

    // Filter by favorited by username
    if (favorited) {
      where.favorites = {
        some: {
          user: { username: favorited },
        },
      };
    }

    const [articles, count] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
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
      }),
      this.prisma.article.count({ where }),
    ]);

    return { articles: articles as ArticleWithRelations[], count };
  }

  /**
   * Get feed articles (from followed users)
   */
  async getFeed(params: GetFeedParams): Promise<{
    articles: ArticleWithRelations[];
    count: number;
  }> {
    const { offset = 0, limit = 20, currentUserId } = params;

    const where = {
      user: {
        followers: {
          some: { followerId: currentUserId },
        },
      },
    };

    const [articles, count] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
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
      }),
      this.prisma.article.count({ where }),
    ]);

    return { articles: articles as ArticleWithRelations[], count };
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const articles = await this.prisma.article.findMany({
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const article of articles) {
      for (const tag of article.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
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
