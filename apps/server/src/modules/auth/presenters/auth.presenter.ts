import type { CurrentUserType } from '$decorators';

import type { RegisterResponse, UserResponse } from '../contracts';
import type { User } from '@monorepo/database/client';

/**
 * Convert CurrentUserType to UserResponse (for GET /auth/me)
 */
export function toUserResponse(user: CurrentUserType): UserResponse {
  return {
    id: user.publicId,
    username: user.username,
  };
}

/**
 * Convert User to RegisterResponse (for POST /auth/register)
 */
export function toRegisterResponse(user: User): RegisterResponse {
  return {
    id: user.publicId,
    username: user.username,
    email: user.email,
  };
}
