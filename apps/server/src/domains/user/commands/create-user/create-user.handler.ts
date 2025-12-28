import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserCommand } from '$domains/user/commands/create-user/create-user.command';
import { UserService } from '$domains/user/services/user.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute(command: CreateUserCommand) {
    return this.service.createUser(command.dto);
  }
}
