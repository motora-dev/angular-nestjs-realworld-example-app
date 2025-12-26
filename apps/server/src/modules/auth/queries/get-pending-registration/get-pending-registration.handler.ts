import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetPendingRegistrationQuery } from './get-pending-registration.query';
import { AuthService } from '../../services';

export interface PendingRegistrationResult {
  email: string;
}

@QueryHandler(GetPendingRegistrationQuery)
export class GetPendingRegistrationHandler implements IQueryHandler<GetPendingRegistrationQuery> {
  constructor(private readonly authService: AuthService) {}

  async execute(query: GetPendingRegistrationQuery): Promise<PendingRegistrationResult | null> {
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
