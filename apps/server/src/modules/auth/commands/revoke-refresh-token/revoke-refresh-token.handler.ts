import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RevokeRefreshTokenCommand } from '$modules/auth/commands/revoke-refresh-token/revoke-refresh-token.command';
import { AuthService } from '$modules/auth/services/auth.service';

@CommandHandler(RevokeRefreshTokenCommand)
export class RevokeRefreshTokenHandler implements ICommandHandler<RevokeRefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RevokeRefreshTokenCommand) {
    if (command.refreshToken) {
      await this.authService.revokeRefreshToken(command.refreshToken);
    }
  }
}
