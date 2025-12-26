import type { UpdateUserRequestDto } from '../../contracts';

export class UpdateUserCommand {
  constructor(
    public readonly userId: number,
    public readonly request: UpdateUserRequestDto,
  ) {}
}
