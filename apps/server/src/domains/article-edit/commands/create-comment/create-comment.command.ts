import { Command } from '@nestjs/cqrs';

import type { CreateCommentRequestDto, SingleCommentDto } from '$domains/article-edit/contracts';

export class CreateCommentCommand extends Command<SingleCommentDto> {
  constructor(
    public readonly slug: string,
    public readonly request: CreateCommentRequestDto,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
