import { Command } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';

export class FavoriteArticleCommand extends Command<SingleArticleDto> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
