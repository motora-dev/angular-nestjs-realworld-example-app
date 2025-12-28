import { toProfileDto } from './profile.presenter';

import type { UserProfile } from '../contracts';

describe('toProfileDto', () => {
  const mockUserProfile: UserProfile = {
    id: 1,
    username: 'testuser',
    bio: 'Test bio',
    image: 'https://example.com/image.jpg',
  };

  it('should convert UserProfile to ProfileDto correctly', () => {
    const isFollowing = true;

    const result = toProfileDto(mockUserProfile, isFollowing);

    expect(result).toEqual({
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
      following: true,
    });
  });

  it('should set following to false when isFollowing is false', () => {
    const result = toProfileDto(mockUserProfile, false);

    expect(result.following).toBe(false);
  });

  it('should handle null bio and image', () => {
    const userWithNullValues: UserProfile = {
      ...mockUserProfile,
      bio: null,
      image: null,
    };

    const result = toProfileDto(userWithNullValues, false);

    expect(result.bio).toBeNull();
    expect(result.image).toBeNull();
  });
});
