import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import type { ProfileResponseDto } from '$domains/profile/contracts';
import { toProfileDto } from '$domains/profile/presenters/profile.presenter';
import { ProfileRepository } from '$domains/profile/repositories/profile.repository';
import { NotFoundError } from '$errors';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /**
   * Get profile by username
   */
  async getProfile(username: string, currentUserId?: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }

    const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, user.id) : false;

    return { profile: toProfileDto(user, isFollowing) };
  }

  /**
   * Follow a user
   */
  async followUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }

    await this.repository.follow(currentUserId, user.id);

    return { profile: toProfileDto(user, true) };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(username: string, currentUserId: number): Promise<ProfileResponseDto> {
    const user = await this.repository.getByUsername(username);

    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }

    await this.repository.unfollow(currentUserId, user.id);

    return { profile: toProfileDto(user, false) };
  }
}
