import { Command } from '@nestjs/cqrs';

export type ProcessOAuthCallbackResult =
  | { type: 'login'; accessToken: string; refreshToken: string }
  | { type: 'register'; pendingToken: string };

export class ProcessOAuthCallbackCommand extends Command<ProcessOAuthCallbackResult> {
  constructor(
    public readonly provider: string,
    public readonly sub: string,
    public readonly email: string,
  ) {
    super();
  }
}
