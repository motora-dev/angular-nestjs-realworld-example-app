import { Query } from '@nestjs/cqrs';

import type { UserInfo } from '$modules/auth/contracts';
import { GetAuthUserInfoQuery } from './get-auth-user-info.query';

describe('GetAuthUserInfoQuery', () => {
  const mockPayload = {
    id: 1,
    publicId: 'test-public-id',
    username: 'testuser',
  };

  it('should create a GetAuthUserInfoQuery with correct properties and extend Query', () => {
    const query = new GetAuthUserInfoQuery(mockPayload);

    expect(query).toBeInstanceOf(GetAuthUserInfoQuery);
    expect(query).toBeInstanceOf(Query<UserInfo>);
    expect(query.payload).toEqual(mockPayload);
  });

  it('should set payload property correctly', () => {
    const query = new GetAuthUserInfoQuery(mockPayload);

    expect(query.payload).toEqual(mockPayload);
  });
});
