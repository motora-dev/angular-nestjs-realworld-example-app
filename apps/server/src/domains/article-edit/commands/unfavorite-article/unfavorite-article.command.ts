import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';

export class UnfavoriteArticleCommand extends Command<SingleArticleDto> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
