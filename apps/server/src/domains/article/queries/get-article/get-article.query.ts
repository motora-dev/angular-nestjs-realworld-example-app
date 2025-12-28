import { Query } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article/contracts';

export class GetArticleQuery extends Query<SingleArticleDto> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId?: number,
  ) {
    super();
  }
}
