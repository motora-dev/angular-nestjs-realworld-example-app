import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserResponseDto } from '$domains/user/dto';
import { UserService } from '$domains/user/services';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResponseDto> {
    const user = await this.userService.findOrCreateUser(command.provider, command.sub, command.email);
    return {
      id: user.publicId,
    };
  }
}
