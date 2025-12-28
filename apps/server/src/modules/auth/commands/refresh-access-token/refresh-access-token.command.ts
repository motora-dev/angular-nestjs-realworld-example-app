import { Command } from '@nestjs/cqrs';

export interface RefreshAccessTokenResult {
  accessToken: string;
}

export class RefreshAccessTokenCommand extends Command<RefreshAccessTokenResult | null> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
