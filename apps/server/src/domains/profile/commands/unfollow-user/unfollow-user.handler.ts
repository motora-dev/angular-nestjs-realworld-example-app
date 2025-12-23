import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UnfollowUserCommand } from './unfollow-user.command';
import { ProfileService } from '../../services/profile.service';

import type { ProfileResponseDto } from '../../dto';

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserHandler implements ICommandHandler<UnfollowUserCommand> {
  constructor(private readonly service: ProfileService) {}

  async execute(command: UnfollowUserCommand): Promise<ProfileResponseDto> {
    return this.service.unfollowUser(command.username, command.currentUserId);
  }
}
