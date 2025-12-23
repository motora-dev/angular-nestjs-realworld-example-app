import type { UpdateUserRequestDto } from '../../dto';

export class UpdateUserCommand {
  constructor(
    public readonly userId: number,
    public readonly request: UpdateUserRequestDto,
  ) {}
}
