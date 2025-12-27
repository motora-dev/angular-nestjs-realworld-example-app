import { Query } from '@nestjs/cqrs';

import { JwtPayload, type UserInfo } from '$modules/auth/contracts';

export class GetAuthUserInfoQuery extends Query<UserInfo> {
  constructor(public readonly payload: JwtPayload) {
    super();
  }
}
