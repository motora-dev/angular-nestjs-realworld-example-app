import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  ProcessOAuthCallbackCommand,
  type ProcessOAuthCallbackResult,
} from '$modules/auth/commands/process-oauth-callback/process-oauth-callback.command';
import { AuthService } from '$modules/auth/services/auth.service';

@CommandHandler(ProcessOAuthCallbackCommand)
export class ProcessOAuthCallbackHandler implements ICommandHandler<ProcessOAuthCallbackCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: ProcessOAuthCallbackCommand): Promise<ProcessOAuthCallbackResult> {
    const { provider, sub, email } = command;

    // Check if user exists
    const user = await this.authService.findUser(provider, sub);

    if (user) {
      // User exists - generate tokens
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user.id);

      return { type: 'login', accessToken, refreshToken };
    } else {
      // User does not exist - generate pending registration token
      const pendingToken = this.authService.generatePendingRegistrationToken(provider, sub, email);

      return { type: 'register', pendingToken };
    }
  }
}
