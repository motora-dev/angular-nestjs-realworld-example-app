import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { UserResponseDto } from '../../dto';
import { UserService } from '../../services/user.service';
import { GetCurrentUserQuery } from './get-current-user.query';

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler
  implements IQueryHandler<GetCurrentUserQuery>
{
  constructor(private readonly service: UserService) {}

  async execute(query: GetCurrentUserQuery): Promise<UserResponseDto> {
    return this.service.getCurrentUser(query.userId);
  }
}

