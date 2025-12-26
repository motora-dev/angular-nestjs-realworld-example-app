import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RefreshAccessTokenCommand } from './refresh-access-token.command';
import { AuthService } from '../../services';

export interface RefreshAccessTokenResult {
  accessToken: string;
}

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
