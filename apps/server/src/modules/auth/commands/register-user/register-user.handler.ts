import { ERROR_CODE } from '@monorepo/error-code';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ConflictError, UnauthorizedError } from '$errors';
import {
  RegisterUserCommand,
  type RegisterUserResult,
} from '$modules/auth/commands/register-user/register-user.command';
import { toRegisterResponse } from '$modules/auth/presenters/auth.presenter';
import { AuthService } from '$modules/auth/services/auth.service';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const { pendingToken, username } = command;

    // Verify pending token
    const pending = this.authService.verifyPendingRegistrationToken(pendingToken);
    if (!pending) {
      throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
    }

    // Check if username is already taken
    const isUsernameTaken = await this.authService.isUsernameTaken(username);
    if (isUsernameTaken) {
      throw new ConflictError(ERROR_CODE.USERNAME_ALREADY_EXISTS);
    }

    // Check if email is already registered
    const existingUser = await this.authService.findUserByEmail(pending.email);
    if (existingUser) {
      throw new ConflictError(ERROR_CODE.EMAIL_ALREADY_EXISTS);
    }

    // Create user
    const user = await this.authService.registerUser(pending.provider, pending.sub, pending.email, username);

    // Generate tokens
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user.id);

    return {
      response: toRegisterResponse(user),
      accessToken,
      refreshToken,
    };
  }
}
