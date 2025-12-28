import { Query } from '@nestjs/cqrs';

import type { UserResponse } from '$modules/auth/contracts';
import { GetAuthUserQuery } from './get-auth-user.query';

describe('GetAuthUserQuery', () => {
  const mockPayload = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  it('should create a GetAuthUserQuery with correct properties and extend Query', () => {
    const query = new GetAuthUserQuery(mockPayload);

    expect(query).toBeInstanceOf(GetAuthUserQuery);
    expect(query).toBeInstanceOf(Query<UserResponse>);
    expect(query.payload).toEqual(mockPayload);
  });

  it('should set payload property correctly', () => {
    const query = new GetAuthUserQuery(mockPayload);

    expect(query.payload).toEqual(mockPayload);
  });
});
