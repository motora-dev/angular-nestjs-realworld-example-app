import { ICommand } from '@nestjs/cqrs';

export class RefreshAccessTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string) {}
}
