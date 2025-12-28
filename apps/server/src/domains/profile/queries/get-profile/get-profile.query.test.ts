import { Query } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '$domains/profile/contracts';
import { GetProfileQuery } from './get-profile.query';

describe('GetProfileQuery', () => {
  it('should create a GetProfileQuery with correct properties and extend Query', () => {
    const username = 'testuser';
    const currentUserId = 1;
    const query = new GetProfileQuery(username, currentUserId);

    expect(query).toBeInstanceOf(GetProfileQuery);
    expect(query).toBeInstanceOf(Query<ProfileResponseDto>);
    expect(query.username).toBe(username);
    expect(query.currentUserId).toBe(currentUserId);
  });

  it('should create a GetProfileQuery without currentUserId', () => {
    const username = 'testuser';
    const query = new GetProfileQuery(username);

    expect(query).toBeInstanceOf(GetProfileQuery);
    expect(query).toBeInstanceOf(Query<ProfileResponseDto>);
    expect(query.username).toBe(username);
    expect(query.currentUserId).toBeUndefined();
  });

  it('should set username property correctly', () => {
    const username = 'specific-username';
    const query = new GetProfileQuery(username);

    expect(query.username).toBe(username);
  });
});
