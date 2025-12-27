import { Query } from '@nestjs/cqrs';

import { GetArticlesQueryDto, type MultipleArticlesDto } from '$domains/article-list/contracts';

export class GetArticlesQuery extends Query<MultipleArticlesDto> {
  constructor(
    public readonly params: GetArticlesQueryDto,
    public readonly currentUserId?: number,
  ) {
    super();
  }
}
