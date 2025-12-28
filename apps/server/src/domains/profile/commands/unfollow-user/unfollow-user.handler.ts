import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UnfollowUserCommand } from '$domains/profile/commands/unfollow-user/unfollow-user.command';
import { ProfileService } from '$domains/profile/services/profile.service';

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserHandler implements ICommandHandler<UnfollowUserCommand> {
  constructor(private readonly service: ProfileService) {}

  async execute(command: UnfollowUserCommand) {
    return this.service.unfollowUser(command.username, command.currentUserId);
  }
}
