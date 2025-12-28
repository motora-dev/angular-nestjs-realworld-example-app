import { Query } from '@nestjs/cqrs';

export interface PendingRegistrationResult {
  email: string;
}

export class GetPendingRegistrationQuery extends Query<PendingRegistrationResult | null> {
  constructor(public readonly pendingToken: string | undefined) {
    super();
  }
}
