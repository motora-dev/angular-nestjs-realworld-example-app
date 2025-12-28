import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto, UpdateArticleRequestDto } from '$domains/article-edit/contracts';

export class UpdateArticleCommand extends Command<SingleArticleDto> {
  constructor(
    public readonly slug: string,
    public readonly request: UpdateArticleRequestDto,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
