import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateUserCommand } from './create-user.command';
import { UserService } from '../../services/user.service';

import type { CreateUserResponseDto } from '../../dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResponseDto> {
    return this.service.createUser(command.dto);
  }
}
