import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { UserResponse } from '$modules/auth/contracts';
import { toUserResponse } from '$modules/auth/presenters';
import { AuthService } from '$modules/auth/services/auth.service';
import { GetAuthUserQuery } from './get-auth-user.query';

@QueryHandler(GetAuthUserQuery)
export class GetAuthUserHandler implements IQueryHandler<GetAuthUserQuery> {
  constructor(private readonly service: AuthService) {}

  async execute(query: GetAuthUserQuery): Promise<UserResponse> {
    return toUserResponse(query.payload);
  }
}
