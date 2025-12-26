import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RevokeRefreshTokenCommand } from './revoke-refresh-token.command';
import { AuthService } from '../../services';

@CommandHandler(RevokeRefreshTokenCommand)
export class RevokeRefreshTokenHandler implements ICommandHandler<RevokeRefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RevokeRefreshTokenCommand): Promise<void> {
    if (command.refreshToken) {
      await this.authService.revokeRefreshToken(command.refreshToken);
    }
  }
}
