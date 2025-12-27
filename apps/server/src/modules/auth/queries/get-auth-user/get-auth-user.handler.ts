import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { toUserResponse } from '$modules/auth/presenters';
import { GetAuthUserQuery } from './get-auth-user.query';

@QueryHandler(GetAuthUserQuery)
export class GetAuthUserHandler implements IQueryHandler<GetAuthUserQuery> {
  async execute(query: GetAuthUserQuery) {
    return toUserResponse(query.payload);
  }
}
