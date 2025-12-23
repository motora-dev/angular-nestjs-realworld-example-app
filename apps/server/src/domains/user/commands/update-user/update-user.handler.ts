import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateUserCommand } from './update-user.command';
import { UserService } from '../../services/user.service';

import type { UserResponseDto } from '../../contracts';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    return this.service.updateUser(command.userId, command.request);
  }
}
