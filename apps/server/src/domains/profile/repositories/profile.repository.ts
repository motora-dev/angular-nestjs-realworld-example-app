import { Injectable } from '@nestjs/common';

import { PrismaAdapter } from '$adapters';

export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  image: string | null;
}

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  /**
   * Get user by username
   */
  async getByUsername(username: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      },
    });

    return user;
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

  /**
   * Follow a user
   */
  async follow(followerId: number, followingId: number): Promise<void> {
    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    });
  }

  /**
   * Unfollow a user
   */
  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
  }
}
