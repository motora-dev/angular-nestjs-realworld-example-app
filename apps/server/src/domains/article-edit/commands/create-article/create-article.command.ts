import { Command } from '@nestjs/cqrs';

import type { CreateArticleRequestDto, SingleArticleDto } from '$domains/article-edit/contracts';

export class CreateArticleCommand extends Command<SingleArticleDto> {
  constructor(
    public readonly request: CreateArticleRequestDto,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
