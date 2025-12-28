import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { toUserResponse } from '$modules/auth/presenters/auth.presenter';
import { GetAuthUserQuery } from '$modules/auth/queries/get-auth-user/get-auth-user.query';

@QueryHandler(GetAuthUserQuery)
export class GetAuthUserHandler implements IQueryHandler<GetAuthUserQuery> {
  async execute(query: GetAuthUserQuery) {
    return toUserResponse(query.payload);
  }
}
