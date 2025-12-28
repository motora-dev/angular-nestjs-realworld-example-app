import { Query } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '$domains/profile/contracts';

export class GetProfileQuery extends Query<ProfileResponseDto> {
  constructor(
    public readonly username: string,
    public readonly currentUserId?: number,
  ) {
    super();
  }
}
