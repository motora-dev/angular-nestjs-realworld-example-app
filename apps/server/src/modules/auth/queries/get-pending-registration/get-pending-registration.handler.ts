import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPendingRegistrationQuery } from '$modules/auth/queries/get-pending-registration/get-pending-registration.query';
import { AuthService } from '$modules/auth/services/auth.service';

@QueryHandler(GetPendingRegistrationQuery)
export class GetPendingRegistrationHandler implements IQueryHandler<GetPendingRegistrationQuery> {
  constructor(private readonly authService: AuthService) {}

  async execute(query: GetPendingRegistrationQuery) {
    if (!query.pendingToken) {
      return null;
    }

    const pending = this.authService.verifyPendingRegistrationToken(query.pendingToken);
    if (!pending) {
      return null;
    }

    return { email: pending.email };
  }
}
