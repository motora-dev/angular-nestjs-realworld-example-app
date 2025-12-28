import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateUserCommand } from '$domains/user/commands/update-user/update-user.command';
import { UserService } from '$domains/user/services/user.service';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute(command: UpdateUserCommand) {
    return this.service.updateUser(command.userId, command.request);
  }
}
