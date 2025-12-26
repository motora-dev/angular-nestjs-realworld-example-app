import { ICommand } from '@nestjs/cqrs';

export class RegisterUserCommand implements ICommand {
  constructor(
    public readonly pendingToken: string,
    public readonly username: string,
  ) {}
}
