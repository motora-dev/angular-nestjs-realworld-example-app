import { Query } from '@nestjs/cqrs';

import type { UserResponseDto } from '$domains/user/contracts';

export class GetCurrentUserQuery extends Query<UserResponseDto> {
  constructor(public readonly userId: number) {
    super();
  }
}
