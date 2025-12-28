import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { FollowUserCommand } from '$domains/profile/commands/follow-user/follow-user.command';
import { ProfileService } from '$domains/profile/services/profile.service';

@CommandHandler(FollowUserCommand)
export class FollowUserHandler implements ICommandHandler<FollowUserCommand> {
  constructor(private readonly service: ProfileService) {}

  async execute(command: FollowUserCommand) {
    return this.service.followUser(command.username, command.currentUserId);
  }
}
