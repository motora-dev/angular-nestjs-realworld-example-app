import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '../../dto';
import { ProfileService } from '../../services/profile.service';
import { FollowUserCommand } from './follow-user.command';

@CommandHandler(FollowUserCommand)
export class FollowUserHandler implements ICommandHandler<FollowUserCommand> {
  constructor(private readonly service: ProfileService) {}

  async execute(command: FollowUserCommand): Promise<ProfileResponseDto> {
    return this.service.followUser(command.username, command.currentUserId);
  }
}

