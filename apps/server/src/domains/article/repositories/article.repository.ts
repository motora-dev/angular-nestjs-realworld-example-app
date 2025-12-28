import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import {
  articleWithRelationsInclude,
  commentWithAuthorInclude,
  type ArticleWithRelations,
  type CommentWithAuthor,
} from '$domains/article/contracts';

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get article by slug
   */
  async getBySlug(slug: string): Promise<ArticleWithRelations | null> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: articleWithRelationsInclude,
    });

    return article;
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
      include: commentWithAuthorInclude,
    });

    return comments;
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
