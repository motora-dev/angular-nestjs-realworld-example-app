import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  RefreshAccessTokenCommand,
  type RefreshAccessTokenResult,
} from '$modules/auth/commands/refresh-access-token/refresh-access-token.command';
import { AuthService } from '$modules/auth/services/auth.service';

@CommandHandler(RefreshAccessTokenCommand)
export class RefreshAccessTokenHandler implements ICommandHandler<RefreshAccessTokenCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshAccessTokenCommand): Promise<RefreshAccessTokenResult | null> {
    const user = await this.authService.validateRefreshToken(command.refreshToken);
    if (!user) {
      return null;
    }

    const accessToken = this.authService.generateAccessToken(user);
    return { accessToken };
  }
}
