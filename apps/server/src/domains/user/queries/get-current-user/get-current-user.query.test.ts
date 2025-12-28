import { Query } from '@nestjs/cqrs';

import type { UserResponseDto } from '$domains/user/contracts';
import { GetCurrentUserQuery } from './get-current-user.query';

describe('GetCurrentUserQuery', () => {
  it('should create a GetCurrentUserQuery with correct properties and extend Query', () => {
    const userId = 1;
    const query = new GetCurrentUserQuery(userId);

    expect(query).toBeInstanceOf(GetCurrentUserQuery);
    expect(query).toBeInstanceOf(Query<UserResponseDto>);
    expect(query.userId).toBe(userId);
  });

  it('should set userId property correctly', () => {
    const userId = 2;
    const query = new GetCurrentUserQuery(userId);

    expect(query.userId).toBe(userId);
  });
});
