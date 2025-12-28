import { toUserDto } from './user.presenter';

import type { UserWithAccount } from '../contracts';

describe('toUserDto', () => {
  const mockUserWithAccount: UserWithAccount = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  it('should convert UserWithAccount to UserDto correctly', () => {
    const result = toUserDto(mockUserWithAccount);

    expect(result).toEqual({
      email: 'test@example.com',
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
    });
  });

  it('should handle null bio and image', () => {
    const userWithNullValues: UserWithAccount = {
      ...mockUserWithAccount,
      bio: null,
      image: null,
    };

    const result = toUserDto(userWithNullValues);

    expect(result.bio).toBeNull();
    expect(result.image).toBeNull();
  });
});
