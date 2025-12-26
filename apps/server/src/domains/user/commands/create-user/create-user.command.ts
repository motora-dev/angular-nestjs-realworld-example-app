import type { CreateUserDto } from '../../contracts';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}
