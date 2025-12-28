import { Query } from '@nestjs/cqrs';

import type { MultipleCommentsDto } from '$domains/article/contracts';

export class GetCommentsQuery extends Query<MultipleCommentsDto> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId?: number,
  ) {
    super();
  }
}
