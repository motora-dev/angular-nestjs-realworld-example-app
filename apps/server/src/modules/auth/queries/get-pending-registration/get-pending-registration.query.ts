import { IQuery } from '@nestjs/cqrs';

export class GetPendingRegistrationQuery implements IQuery {
  constructor(public readonly pendingToken: string | undefined) {}
}
