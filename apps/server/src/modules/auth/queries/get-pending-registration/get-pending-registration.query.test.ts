import { Query } from '@nestjs/cqrs';

import { GetPendingRegistrationQuery, type PendingRegistrationResult } from './get-pending-registration.query';

describe('GetPendingRegistrationQuery', () => {
  it('should create a GetPendingRegistrationQuery with pendingToken and extend Query', () => {
    const pendingToken = 'test-token';
    const query = new GetPendingRegistrationQuery(pendingToken);

    expect(query).toBeInstanceOf(GetPendingRegistrationQuery);
    expect(query).toBeInstanceOf(Query<PendingRegistrationResult | null>);
    expect(query.pendingToken).toBe(pendingToken);
  });

  it('should create a GetPendingRegistrationQuery without pendingToken', () => {
    const query = new GetPendingRegistrationQuery(undefined);

    expect(query).toBeInstanceOf(GetPendingRegistrationQuery);
    expect(query).toBeInstanceOf(Query<PendingRegistrationResult | null>);
    expect(query.pendingToken).toBeUndefined();
  });
});
