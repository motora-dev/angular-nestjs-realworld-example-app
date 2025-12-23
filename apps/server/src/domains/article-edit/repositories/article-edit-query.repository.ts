import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';
import {
  articleWithRelationsInclude,
  commentWithAuthorInclude,
  type ArticleWithRelations,
  type CommentWithAuthor,
} from '../contracts';

@Injectable()
export class ArticleEditQueryRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get article by slug with relations
   */
  async getBySlug(slug: string): Promise<ArticleWithRelations | null> {
    return this.prisma.article.findUnique({
      where: { slug },
      include: articleWithRelationsInclude,
    });
  }

  /**
   * Get comment by id with author
   */
  async getComment(commentId: number): Promise<CommentWithAuthor | null> {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      include: commentWithAuthorInclude,
    });
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
