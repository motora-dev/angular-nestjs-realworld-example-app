import { Command } from '@nestjs/cqrs';

import type { UpdateUserRequestDto, UserResponseDto } from '$domains/user/contracts';

export class UpdateUserCommand extends Command<UserResponseDto> {
  constructor(
    public readonly userId: number,
    public readonly request: UpdateUserRequestDto,
  ) {
    super();
  }
}
