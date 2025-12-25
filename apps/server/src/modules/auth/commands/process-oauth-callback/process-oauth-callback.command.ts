import { ICommand } from '@nestjs/cqrs';

export class ProcessOAuthCallbackCommand implements ICommand {
  constructor(
    public readonly provider: string,
    public readonly sub: string,
    public readonly email: string,
  ) {}
}
