import { Query } from '@nestjs/cqrs';

import type { TagsDto } from '$domains/article-list/contracts';

export class GetTagsQuery extends Query<TagsDto> {
  constructor() {
    super();
  }
}
