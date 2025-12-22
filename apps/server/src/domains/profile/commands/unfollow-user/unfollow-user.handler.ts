import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '../../dto';
import { ProfileService } from '../../services/profile.service';
import { UnfollowUserCommand } from './unfollow-user.command';

@CommandHandler(UnfollowUserCommand)
export class UnfollowUserHandler
  implements ICommandHandler<UnfollowUserCommand>
{
  constructor(private readonly service: ProfileService) {}

  async execute(command: UnfollowUserCommand): Promise<ProfileResponseDto> {
    return this.service.unfollowUser(command.username, command.currentUserId);
  }
}

