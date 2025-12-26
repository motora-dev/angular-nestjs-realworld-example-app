import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCurrentAuthUserQuery } from './get-current-auth-user.query';
import { toUserResponse } from '../../presenters';

import type { UserResponse } from '../../contracts';

@QueryHandler(GetCurrentAuthUserQuery)
export class GetCurrentAuthUserHandler implements IQueryHandler<GetCurrentAuthUserQuery> {
  async execute(query: GetCurrentAuthUserQuery): Promise<UserResponse> {
    return toUserResponse(query.user);
  }
}
