import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '$modules/auth/services/auth.service';
import { RevokeRefreshTokenCommand } from './revoke-refresh-token.command';

@CommandHandler(RevokeRefreshTokenCommand)
export class RevokeRefreshTokenHandler implements ICommandHandler<RevokeRefreshTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RevokeRefreshTokenCommand) {
    if (command.refreshToken) {
      await this.authService.revokeRefreshToken(command.refreshToken);
    }
  }
}
