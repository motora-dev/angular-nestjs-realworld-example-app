import { Query } from '@nestjs/cqrs';

import type { GetFeedQueryDto, MultipleArticlesDto } from '$domains/article-list/contracts';

export class GetFeedQuery extends Query<MultipleArticlesDto> {
  constructor(
    public readonly params: GetFeedQueryDto,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
