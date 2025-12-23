import type { CreateCommentRequestDto } from '../../contracts';

export class CreateCommentCommand {
  constructor(
    public readonly slug: string,
    public readonly request: CreateCommentRequestDto,
    public readonly currentUserId: number,
  ) {}
}
