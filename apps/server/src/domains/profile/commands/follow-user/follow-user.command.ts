import { Command } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '$domains/profile/contracts';

export class FollowUserCommand extends Command<ProfileResponseDto> {
  constructor(
    public readonly username: string,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
