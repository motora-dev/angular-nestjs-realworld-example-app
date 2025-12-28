import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCurrentUserQuery } from '$domains/user/queries/get-current-user/get-current-user.query';
import { UserService } from '$domains/user/services/user.service';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly service: UserService) {}

  async execute(query: GetCurrentUserQuery) {
    return this.service.getCurrentUser(query.userId);
  }
}
