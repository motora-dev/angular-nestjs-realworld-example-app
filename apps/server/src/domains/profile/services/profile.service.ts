import { Injectable, NotFoundException } from '@nestjs/common';

import { ProfileRepository } from '../repositories/profile.repository';

import type { ProfileDto, ProfileResponseDto } from '../dto';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /**
   * Get profile by username
   */
  async getProfile(username: string, currentUserId?: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, user.id) : false;

    const profile: ProfileDto = {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: isFollowing,
    };

    return { profile };
  }

  /**
   * Follow a user
   */
  async followUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.repository.follow(currentUserId, user.id);

    const profile: ProfileDto = {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: true,
    };

    return { profile };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.repository.unfollow(currentUserId, user.id);

    const profile: ProfileDto = {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: false,
    };

    return { profile };
  }
}
