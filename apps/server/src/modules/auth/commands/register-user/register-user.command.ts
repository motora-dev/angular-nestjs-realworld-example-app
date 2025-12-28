import { Command } from '@nestjs/cqrs';

import type { RegisterResponse } from '$modules/auth/contracts';

export interface RegisterUserResult {
  response: RegisterResponse;
  accessToken: string;
  refreshToken: string;
}

export class RegisterUserCommand extends Command<RegisterUserResult> {
  constructor(
    public readonly pendingToken: string,
    public readonly username: string,
  ) {
    super();
  }
}
