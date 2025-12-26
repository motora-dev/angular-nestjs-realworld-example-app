import type { UserDto, UserWithAccount } from '../contracts';

/**
 * Convert UserWithAccount (DB model) to UserDto (API response)
 */
export function toUserDto(user: UserWithAccount): UserDto {
  return {
    email: user.email,
    username: user.username,
    bio: user.bio,
    image: user.image,
  };
}
