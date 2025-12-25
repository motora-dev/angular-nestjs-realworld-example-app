import { ICommand } from '@nestjs/cqrs';

export class RevokeRefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string | undefined) {}
}
