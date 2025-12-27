import { Command } from '@nestjs/cqrs';

export class RevokeRefreshTokenCommand extends Command<void> {
  constructor(public readonly refreshToken: string | undefined) {
    super();
  }
}
