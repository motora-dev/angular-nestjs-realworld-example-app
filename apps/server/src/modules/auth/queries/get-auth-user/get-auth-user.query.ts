import { Query } from '@nestjs/cqrs';

import { JwtPayload, type UserResponse } from '$modules/auth/contracts';

export class GetAuthUserQuery extends Query<UserResponse> {
  constructor(public readonly payload: JwtPayload) {
    super();
  }
}
