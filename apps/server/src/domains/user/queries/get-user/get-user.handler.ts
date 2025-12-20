import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserResponseDto } from '$domains/user/dto';
import { UserService } from '$domains/user/services';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserQuery): Promise<GetUserResponseDto> {
    const user = await this.userService.getUserByProvider(query.provider, query.sub);

    return {
      id: user.publicId,
    };
  }
}
