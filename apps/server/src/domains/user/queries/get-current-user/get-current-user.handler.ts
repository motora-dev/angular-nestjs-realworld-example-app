import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetCurrentUserQuery } from './get-current-user.query';
import { UserService } from '../../services/user.service';

import type { UserResponseDto } from '../../contracts';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly service: UserService) {}

  async execute(query: GetCurrentUserQuery): Promise<UserResponseDto> {
    return this.service.getCurrentUser(query.userId);
  }
}
