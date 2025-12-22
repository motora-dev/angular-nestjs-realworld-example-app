import type { CreateCommentRequestDto } from '../../dto';

export class CreateCommentCommand {
  constructor(
    public readonly slug: string,
    public readonly request: CreateCommentRequestDto,
    public readonly currentUserId: number,
  ) {}
}

