import { Query } from '@nestjs/cqrs';

import type { SingleArticleDto } from '$domains/article-edit/contracts';

export class GetArticleForEditQuery extends Query<SingleArticleDto> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
