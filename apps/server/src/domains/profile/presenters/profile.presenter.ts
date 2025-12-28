import type { ProfileDto, UserProfile } from '$domains/profile/contracts';

/**
 * Convert UserProfile (DB model) to ProfileDto (API response)
 */
export function toProfileDto(user: UserProfile, isFollowing: boolean): ProfileDto {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: isFollowing,
  };
}
