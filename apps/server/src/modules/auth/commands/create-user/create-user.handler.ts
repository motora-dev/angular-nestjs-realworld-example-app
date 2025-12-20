import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { AuthService } from '$modules/auth/services/auth.service';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserFromGoogleHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: CreateUserCommand): Promise<void> {
    // Googleアカウントからユーザーの作成または取得
    await this.authService.findOrCreateUser(command.provider, command.sub, command.email);
  }
}
