import { ERROR_CODE } from '@monorepo/error-code';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { toUserInfo } from '$modules/auth/presenters/auth.presenter';
import { GetAuthUserInfoQuery } from '$modules/auth/queries/get-auth-user-info/get-auth-user-info.query';
import { AuthService } from '$modules/auth/services/auth.service';
import { NotFoundError } from '$shared/errors/app-error';

@QueryHandler(GetAuthUserInfoQuery)
export class GetAuthUserInfoHandler implements IQueryHandler<GetAuthUserInfoQuery> {
  constructor(private readonly service: AuthService) {}

  async execute(query: GetAuthUserInfoQuery) {
    const user = await this.service.findUserById(query.payload.id);
    if (!user) {
      throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND);
    }

    return toUserInfo(user);
  }
}
