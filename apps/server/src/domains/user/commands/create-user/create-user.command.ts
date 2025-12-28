import { Command } from '@nestjs/cqrs';

import type { CreateUserDto, CreateUserResponseDto } from '$domains/user/contracts';

export class CreateUserCommand extends Command<CreateUserResponseDto> {
  constructor(public readonly dto: CreateUserDto) {
    super();
  }
}
