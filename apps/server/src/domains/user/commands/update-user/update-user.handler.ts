import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { UserResponseDto } from '../../dto';
import { UserService } from '../../services/user.service';
import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    return this.service.updateUser(command.userId, command.request);
  }
}

