import { ERROR_CODE } from '@monorepo/error-code';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NotFoundError } from '$errors';
import { AuthService } from '$modules/auth/services/auth.service';
import { CreateUserCommand } from './create-user.command';

/**
 * @deprecated This handler is no longer used.
 * User creation now requires explicit registration via AuthController.register()
 */
@CommandHandler(CreateUserCommand)
export class CreateUserFromGoogleHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: CreateUserCommand): Promise<void> {
    // This command is deprecated. User registration now requires explicit consent.
    // The findUser method only checks if user exists, does not create.
    const user = await this.authService.findUser(command.provider, command.sub);
    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }
  }
}
